import { ApiError } from "./ApiError";
import { getRequiredElementById, querySelector, sleep, getInputById, setNativeValue, beep } from './browser-utils';
import { IBelaviaPreloadContracts } from "./IBelaviaPreloadContracts";
import { TicketResponse } from "./TicketResponse";
import { TicketsRequest } from "./TicketsRequest";

declare const contracts: IBelaviaPreloadContracts;

console.log(`👋 Попробуем найти билетики!`);

let snd: HTMLAudioElement | undefined;

document.addEventListener('keydown', () => stopAudioSignal());
document.addEventListener('click', () => stopAudioSignal());

function stopAudioSignal(): void {
    if (snd === undefined || snd === null)
        return;

    snd.pause();
    snd.remove();

    snd = undefined;
}

function chooseSelector(inputId: string, etalonStartText: string): void {
    const input = getRequiredElementById(inputId);
    input.click();

    let variants: HTMLLIElement[] = Array.from(input.parentElement.parentElement.querySelectorAll('ul li'));
    variants = variants.filter(x => x.innerText.toLowerCase().startsWith(etalonStartText.toLowerCase()));

    if (variants.length === 0)
        throw new Error(`Cannot find variant ${etalonStartText} for input with id ${inputId}`);

    if (variants.length > 1)
        throw new Error(`To many (${variants.length}) variant found with text ${etalonStartText} for input with id ${inputId}`);

    variants[0].click();
}

function toDD_MM_YYYY(date: Date): string {
    const monthFormatted = (date.getMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getDate().toString().padStart(2, '0');

    return `${dateFormatted}.${monthFormatted}.${date.getFullYear()}`;
}

async function processApiResponse(url: string, requestData: Document | XMLHttpRequestBodyInit | null, responseData: string): Promise<void> {
    // console.log('processApiResponse');

    if (url != undefined && url.includes('/api/dc/products/air/search/') && typeof requestData === 'string') {
        const ticketsRequest: TicketsRequest = JSON.parse(requestData);
        const ticketsResponse: TicketResponse = JSON.parse(responseData);

        const tickets = ticketsResponse.unbundledOffers?.flat() ?? [];

        console.log(`Найдено билетов: ${tickets.length}`);

        // contracts.onTickets(tickets.length);

        if (tickets.length === 0) {
            // идем дальше
            contracts.onTickets(tickets.length);
            return;
        }

        setTimeout(() => {
            ticketFoundHandler(tickets.length);
        }, 200);
    }
}

const openArgumentsMap = new Map();
const sendArgumentsMap = new Map();

const proxiedSend = window.XMLHttpRequest.prototype.send;

window.XMLHttpRequest.prototype.send = function (...sendArguments) {
    const request: XMLHttpRequest = this;
    const openArguments = openArgumentsMap.get(this);

    sendArgumentsMap.set(this, sendArguments);

    // console.log('open arguments', openArguments, 'send arguments', arguments);

    request.addEventListener("load", () => {
        openArgumentsMap.delete(request);
        sendArgumentsMap.delete(request);

        const url = openArguments[1];
        const requestJson = sendArguments[0];
        const responseText = this.responseText;

        console.log(`OTHER REQUEST ${request.status}`, url, requestJson, responseText);

        if (request.status >= 300) {
            const error: ApiError = JSON.parse(responseText);
            console.error(`${error.errorCode}. ${error.status}. ${error.type}. ${error.message}`)
            return;
        }

        processApiResponse(url, requestJson, responseText);
    });

    return proxiedSend.apply(this, [].slice.call(sendArguments));
};

const proxiedOpen = window.XMLHttpRequest.prototype.open;

(window.XMLHttpRequest.prototype.open as any) = function (...openArguments: Parameters<typeof window.XMLHttpRequest.prototype.open>) {
    openArgumentsMap.set(this, openArguments);

    // console.log('open arguments', arguments);

    return proxiedOpen.apply(this, [].slice.call(openArguments));
};

async function ticketFoundHandler(ticketCount: number): Promise<void> {
    snd = beep();

    const settings = await contracts.getSettings();

    if (!settings.autoFill) {
        // вопим и всё
        contracts.onTickets(ticketCount);
        return;
    }

    // выставим русские рубли сначала
    const currencyDiv = getRequiredElementById('currency');
    currencyDiv.click();

    await sleep(50);

    const currencyButtons = document.querySelectorAll('.ui-dropdown-menu ul li');
    const targetCurrency = 'RUB';

    const targetButton = Array.from(currencyButtons).map(x => x as HTMLElement).filter(x => x.innerText.toUpperCase() === targetCurrency)[0];

    if (!targetButton.classList.contains('ui-dropdown-menu-item-active')) {
        targetButton.click();
        return;
    }
    else {
        querySelector('.ui-dropdown-menu button.close').click();
        await sleep(50);
    }

    // нажимаем купить первый попавшийся тариф эконом/бизнес
    await sleep(500);
    querySelector('.offer .cabin:not(.no-price)').click();

    // выбираем тариф ещё раз
    await sleep(1000);
    querySelector('.offer-item .brands .brand').click();

    // нажимаем кнопку покупки
    await sleep(2000);
    querySelector('form button[type=submit]').click();

    await sleep(1000);

    // переходим к форме

    // обращение
    if (settings.passengerTitle?.length > 0)
        chooseSelector('passenger-0.title', settings.passengerTitle);

    // фамилия
    if (settings.lastName?.length > 0)
        setNativeValue(getInputById('passenger-0.lastName'), settings.lastName);

    // имя
    if (settings.firstName?.length > 0)
        setNativeValue(getInputById('passenger-0.firstName'), settings.firstName);

    // дата рождения
    if (settings.dateOfBirth != undefined)
        setNativeValue(getInputById('passenger-0.dateOfBirth'), toDD_MM_YYYY(settings.dateOfBirth));

    // национальность
    if (settings.nationality?.length > 0)
        chooseSelector('passenger-0.nationality', settings.nationality);

    // номер документа
    if (settings.documentNumber?.length > 0)
        setNativeValue(getInputById('passenger-0.documentNumber'), settings.documentNumber);

    // срок действия
    if (settings.documentExpirationDate != undefined)
        setNativeValue(getInputById('passenger-0.documentExpirationDate'), toDD_MM_YYYY(settings.documentExpirationDate));

    // Код страны телефона
    if (settings.phoneCountry?.length > 0)
        chooseSelector('contact-0.phoneCountry', settings.phoneCountry);

    // Номер телефона
    if (settings.restPhoneNumber?.length > 0)
        setNativeValue(getInputById('contact-0.phoneNumber'), settings.restPhoneNumber);

    // Email
    if (settings.email?.length > 0)
        setNativeValue(getInputById('contact-0.email'), settings.email);

    // нажимаем кнопку покупки
    await sleep(2000);
    querySelector('form button[type=submit]').click();

    // нажимаем кнопку далее в разделе услуги
    await sleep(5000);
    querySelector('form button[type=submit]').click();

    // Оплата банковской картой
    await sleep(2000);
    getRequiredElementById('paymentType_QQ_105').click()

    // Ознакомились с условиями
    getRequiredElementById('reviewAcknowledgment').click()

    // нажимаем кнопку далее в разделе оплата
    if (settings.aproveTillPayment)
        querySelector('form button[type=submit]').click();
}

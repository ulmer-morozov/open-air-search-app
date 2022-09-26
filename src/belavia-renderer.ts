import { ApiError } from "./ApiError";
import { beep, getElementById, getRequiredElementById, querySelector, sleep, getInputById, simulateKeyPress, setNativeValue } from './browser-utils';
import { IBelaviaPreloadContracts } from "./IBelaviaPreloadContracts";
import { ITicketSearchParameters } from "./ITicketSearchParameters";
import { TicketResponse } from "./TicketResponse";
import { TicketsRequest } from "./TicketsRequest";

declare const contracts: IBelaviaPreloadContracts;

console.log(`👋 Попробуем найти билетики!`);

let snd: HTMLAudioElement | undefined;

document.addEventListener('keydown', () => stopAudioSignal());

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

        if (tickets.length > 0) {
            setTimeout(() => {
                ticketFoundHandler();
            }, 200);
        }
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

async function ticketFoundHandler(): Promise<void> {
    // snd = beep();

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
    chooseSelector('passenger-0.title', passengerTitle);

    // фамилия
    setNativeValue(getInputById('passenger-0.lastName'), lastName);

    // имя
    setNativeValue(getInputById('passenger-0.firstName'), firstName);

    // дата рождения
    setNativeValue(getInputById('passenger-0.dateOfBirth'), toDD_MM_YYYY(dateOfBirth));

    // национальность
    chooseSelector('passenger-0.nationality', nationality);

    // номер документа
    setNativeValue(getInputById('passenger-0.documentNumber'), documentNumber);

    // срок действия
    setNativeValue(getInputById('passenger-0.documentExpirationDate'), toDD_MM_YYYY(documentExpirationDate));

    // Код страны телефона
    chooseSelector('contact-0.phoneCountry', phoneCountry);

    // Номер телефона
    setNativeValue(getInputById('contact-0.phoneNumber'), restPhoneNumber);

    // Email
    setNativeValue(getInputById('contact-0.email'), email);

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
    // querySelector('form button[type=submit]').click();
}

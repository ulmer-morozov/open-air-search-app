import { getRequiredElementById, querySelector, getInputById, setNativeValue, beep, querySelectorWait } from '../../utils-browser';
import { IBelaviaPreloadContracts } from "../../IBelaviaPreloadContracts";
import { sleep } from '../../utils-universal';
import { AviaVendor } from '../../AviaVendor';

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

    let variants: HTMLLIElement[] = Array.from(input.parentElement!.parentElement!.querySelectorAll('ul li'));
    variants = variants.filter(x => x.innerText.toLowerCase().startsWith(etalonStartText.toLowerCase()));

    if (variants.length === 0)
        throw new Error(`Cannot find variant ${etalonStartText} for input with id ${inputId}`);

    if (variants.length > 1)
        throw new Error(`To many (${variants.length}) variant found with text ${etalonStartText} for input with id ${inputId}`);

    variants[0].click();

    console.log(`Заполнено [${inputId}]`);
    console.log(variants[0].innerText);
    console.log('');
}

function toUTC_DD_MM_YYYY(date: Date): string {
    const monthFormatted = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = date.getUTCDate().toString().padStart(2, '0');

    return `${dateFormatted}.${monthFormatted}.${date.getUTCFullYear()}`;
}


async function ticketFoundHandler(ticketCount: number): Promise<void> {
    console.log(`Найдено билетов: ${ticketCount}`);

    contracts.onTickets({ count: ticketCount, vendor: AviaVendor.Belavia });

    if (ticketCount === 0)
        return;

    // билеты найдены
    snd = beep();

    const settings = await contracts.getSettings();

    // небольшая задержка
    // await sleep(1000);

    if (!settings.autoFill)
        return;


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
        // await sleep(50);
    }

    // нажимаем купить первый попавшийся тариф эконом/бизнес
    // await sleep(500);
    // querySelector('.offer .cabin:not(.no-price)').click();

    await querySelectorWait('.offer .cabin:not(.no-price)');

    const offerCabins: HTMLElement[] = Array.from(document.querySelectorAll('.offer .cabin:not(.no-price)'));

    const economs = offerCabins.filter(x => x.innerText.toLowerCase().startsWith('эконом'));
    const buisinesses = offerCabins.filter(x => x.innerText.toLowerCase().startsWith('бизнес'));

    const latestArray: HTMLElement[] = [];

    latestArray.push(...buisinesses);
    latestArray.push(...economs);

    if (latestArray.length === 0)
        throw new Error(`оферов нет( лезем в отладку`)

    // мне нужен был последний эконом)
    // тут можно сделать первый бизнес например
    const latest = latestArray[latestArray.length - 1];

    latest.click();

    // выбираем тариф ещё раз
    (await querySelectorWait('.offer-item .brands .brand')).click();

    // нажимаем кнопку покупки
    (await querySelectorWait('form button[type=submit]')).click();

    // await sleep(5000);
    await querySelectorWait('[id="passenger-0.title"]');

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
        setNativeValue(getInputById('passenger-0.dateOfBirth'), toUTC_DD_MM_YYYY(settings.dateOfBirth));

    // национальность
    if (settings.nationality?.length > 0)
        chooseSelector('passenger-0.nationality', settings.nationality);

    // номер документа
    if (settings.documentNumber?.length > 0)
        setNativeValue(getInputById('passenger-0.documentNumber'), settings.documentNumber);

    // срок действия
    if (settings.documentExpirationDate != undefined)
        setNativeValue(getInputById('passenger-0.documentExpirationDate'), toUTC_DD_MM_YYYY(settings.documentExpirationDate));

    // Код страны телефона
    if (settings.phoneCountry?.length > 0)
        chooseSelector('contact-0.phoneCountry', settings.phoneCountry);

    // Номер телефона
    if (settings.restPhoneNumber?.length > 0)
        setNativeValue(getInputById('contact-0.phoneNumber'), settings.restPhoneNumber);

    // Email
    if (settings.email?.length > 0)
        setNativeValue(getInputById('contact-0.email'), settings.email);

    // дальше не идем, так как форма заполнения данных работает только для одного человека
    if (settings.adults + settings.children + settings.infants > 1)
        return;

    // нажимаем кнопку покупки
    await sleep(100);
    (await querySelectorWait('.passengers form button[type=submit]')).click();

    // нажимаем кнопку далее в разделе услуги
    await sleep(1000);
    (await querySelectorWait('.ancillaries form .cart button[type=submit]')).click();

    // Оплата банковской картой
    await sleep(100);
    (await querySelectorWait('[id="paymentType_QQ_105"]')).click();

    // Ознакомились с условиями
    await sleep(100);
    (await querySelectorWait('[id="reviewAcknowledgment"]')).click()

    // нажимаем кнопку далее в разделе оплата
    if (settings.aproveTillPayment)
        (await querySelectorWait('.review form button[type=submit]')).click();

    // await sleep(2000);

    // ((window as any).contracts as IBelaviaPreloadContracts).openUrlInBrowser(window.location.href);
}

(window as any).ticketFoundHandler = ticketFoundHandler;
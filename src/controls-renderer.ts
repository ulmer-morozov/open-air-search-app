import { getInputById, getTextareaById, cleanDirections, getElementById, parseDirections, stringifyDirections } from './browser-utils';
import "./controls.scss";
import { IControlPreloadContracts } from './IControlPreloadContracts';
import { ITicketSearchParameters } from './ITicketSearchParameters';

declare const contracts: IControlPreloadContracts;

let isSearching = false;

const searchForm = getElementById('searchForm', HTMLFormElement);
const stopButton = getElementById('stopButton', HTMLButtonElement);
const searchButton = getElementById('searchButton', HTMLButtonElement);

const dateFromInput = getInputById('dateFromInput');
const dateToInput = getInputById('dateToInput');

const waitTimeFromInput = getInputById('waitTimeFromInput');
const waitTimeToInput = getInputById('waitTimeToInput');

const directionsTextArea = getTextareaById('directionsInput');

directionsTextArea.onchange = () => {
    directionsTextArea.value = cleanDirections(directionsTextArea.value);
}

const autoFillInput = getInputById('autoFillInput');
const aproveTillPaymentInput = getInputById('aproveTillPaymentInput');
const passengerTitleInput = getInputById('passengerTitleInput');
const lastNameInput = getInputById('lastNameInput');
const firstNameInput = getInputById('firstNameInput');
const dateOfBirthInput = getInputById('dateOfBirthInput');
const nationalityInput = getInputById('nationalityInput');
const documentNumberInput = getInputById('documentNumberInput');
const documentExpirationDateInput = getInputById('documentExpirationDateInput');

const phoneCountryInput = getInputById('phoneCountryInput');
const restPhoneNumberInput = getInputById('restPhoneNumberInput');
const emailInput = getInputById('emailInput');

function setInputEnabled(input: HTMLInputElement | HTMLTextAreaElement, enabled: boolean): void {
    input.readOnly = !enabled;
    input.disabled = !enabled;
}

function setUIEnabled(enabled: boolean) {
    setInputEnabled(dateFromInput, enabled)
    setInputEnabled(dateToInput, enabled)

    setInputEnabled(directionsTextArea, enabled)

    setInputEnabled(waitTimeFromInput, enabled)
    setInputEnabled(waitTimeToInput, enabled)

    searchButton.disabled = !enabled;
    searchButton.hidden = !enabled;

    stopButton.hidden = enabled;
    stopButton.hidden = enabled;

    // данные пассажира

    // обращение
    setInputEnabled(autoFillInput, enabled)
    setInputEnabled(aproveTillPaymentInput, enabled)
    setInputEnabled(passengerTitleInput, enabled)
    setInputEnabled(lastNameInput, enabled);
    setInputEnabled(firstNameInput, enabled)
    setInputEnabled(dateOfBirthInput, enabled)
    setInputEnabled(nationalityInput, enabled)
    setInputEnabled(documentNumberInput, enabled)
    setInputEnabled(documentExpirationDateInput, enabled)
    setInputEnabled(phoneCountryInput, enabled)
    setInputEnabled(restPhoneNumberInput, enabled)
    setInputEnabled(emailInput, enabled)
}

function fillUI(initialSettings: ITicketSearchParameters) {
    console.log('fill UI', initialSettings);

    dateFromInput.valueAsDate = initialSettings.dateFrom;
    dateToInput.valueAsDate = initialSettings.dateTo;

    directionsTextArea.value = stringifyDirections(initialSettings.directions);

    waitTimeFromInput.valueAsNumber = initialSettings.delayMin;
    waitTimeToInput.valueAsNumber = initialSettings.delayMax;

    // пассажирские данные
    autoFillInput.checked = initialSettings.autoFill;
    aproveTillPaymentInput.checked = initialSettings.aproveTillPayment;

    passengerTitleInput.value = initialSettings.passengerTitle;
    lastNameInput.value = initialSettings.lastName;
    firstNameInput.value = initialSettings.firstName;

    dateOfBirthInput.valueAsDate = initialSettings.dateOfBirth;
    nationalityInput.value = initialSettings.nationality;
    documentNumberInput.value = initialSettings.documentNumber;
    documentExpirationDateInput.valueAsDate = initialSettings.documentExpirationDate;

    phoneCountryInput.value = initialSettings.phoneCountry;
    restPhoneNumberInput.value = initialSettings.restPhoneNumber;
    emailInput.value = initialSettings.email;
}

searchForm.onsubmit = (e) => {
    e.preventDefault();

    const searchParameters: ITicketSearchParameters = {
        dateFrom: dateFromInput.valueAsDate ?? new Date(),
        dateTo: dateToInput.valueAsDate ?? new Date(),
        directions: parseDirections(directionsTextArea.value),
        delayMin: waitTimeFromInput.valueAsNumber,
        delayMax: waitTimeToInput.valueAsNumber,
        autoFill: autoFillInput.checked,
        aproveTillPayment: aproveTillPaymentInput.checked,
        passengerTitle: passengerTitleInput.value,
        lastName: lastNameInput.value,
        firstName: firstNameInput.value,
        nationality: nationalityInput.value,
        dateOfBirth: dateOfBirthInput.valueAsDate,
        documentNumber: documentNumberInput.value,
        documentExpirationDate: documentExpirationDateInput.valueAsDate,
        phoneCountry: phoneCountryInput.value,
        restPhoneNumber: restPhoneNumberInput.value,
        email: emailInput.value
    };

    if (searchParameters.directions.length === 0) {
        alert('Empty directions');
        return;
    }

    if (searchParameters.delayMax < searchParameters.delayMin) {
        alert('wait time max cannot be less than wait time min');
        return;
    }

    if (searchParameters.dateFrom > searchParameters.dateTo) {
        alert('Date from cannot be before date to');
        return
    }

    setUIEnabled(false);

    isSearching = true;

    contracts.searchTickets(searchParameters);
}

stopButton.onclick = () => {
    setUIEnabled(true);

    contracts.stopSearch();
}

setUIEnabled(true);

async function start(): Promise<void> {
    const initialSettings = await contracts.getSettings();

    fillUI(initialSettings);
}

start();

import { getInputById, getTextareaById, getElementById } from './utils-browser';
import "./controls.scss";
import { IControlPreloadContracts } from './IControlPreloadContracts';
import { ITicketSearchParameters } from './ITicketSearchParameters';
import { cleanDirections, stringifyDirections, dateNowUtc, parseDirections } from './utils-universal';

export enum FieldType {
    Number = 'number'
}

export interface IFieldDescription {
    name: keyof ITicketSearchParameters;
    title: string;
    defaultValue: any;
    type: FieldType;
}

export interface IFieldDescriptionGroup {
    title: string;
    name: string;
    items: IFieldDescription[];
}

const fieldGroups: IFieldDescriptionGroup[] = [
    {
        title: '',
        name: 'passengers-type',
        items: [
            { name: 'adults', title: 'Взрослых', defaultValue: 1, type: FieldType.Number },
            { name: 'children', title: 'Детей', defaultValue: 1, type: FieldType.Number },
            { name: 'infants', title: 'Младенцев', defaultValue: 1, type: FieldType.Number }
        ]
    }
];

declare const contracts: IControlPreloadContracts;

const controlDictionary = new Map<keyof ITicketSearchParameters, HTMLInputElement | HTMLTextAreaElement>();
const descriptionMap = new Map<keyof ITicketSearchParameters, IFieldDescription>();

// мапа всех описаний
fieldGroups.forEach(x => x.items.forEach(y => descriptionMap.set(y.name, y)));


let isSearching = false;

const searchForm = getElementById('searchForm', HTMLFormElement);
const stopButton = getElementById('stopButton', HTMLButtonElement);
const searchButton = getElementById('searchButton', HTMLButtonElement);
const dynamicFormContainer = getElementById('dynamicFormGroups', HTMLDivElement);

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

    stopButton.disabled = enabled;
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

    // динамические контролы включить/выключить
    controlDictionary.forEach(
        (control) => {
            setInputEnabled(control, enabled)
        }
    );
}

function fillUI(initialSettings: ITicketSearchParameters) {
    // console.log('fill UI', initialSettings);

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

    controlDictionary.clear();
    dynamicFormContainer.innerHTML = '';

    for (let i = 0; i < fieldGroups.length; i++) {
        const fieldGroup = fieldGroups[i];

        const sectionEl = document.createElement('div');
        sectionEl.classList.add('form-section', fieldGroup.name);

        if (fieldGroup.title?.length > 0)
            sectionEl.innerHTML = `<h6>${fieldGroup.title}</h6>`;

        dynamicFormContainer.appendChild(sectionEl);

        for (let j = 0; j < fieldGroup.items.length; j++) {
            const fieldDescription = fieldGroup.items[j];

            const wrapperEl = document.createElement('div');
            wrapperEl.classList.add('form-group');

            sectionEl.appendChild(wrapperEl);

            const label = document.createElement('label');
            label.innerText = fieldDescription.title;

            wrapperEl.appendChild(label);

            if (fieldDescription.type !== FieldType.Number)
                throw new Error('Not implemented! Надо добавить другие типы для динамической генерации формы');

            const numberInput = document.createElement('input');
            numberInput.id = `gen_${fieldDescription.name}Input`;
            numberInput.type = 'number';
            numberInput.name = fieldDescription.name;
            numberInput.valueAsNumber = initialSettings[fieldDescription.name] as number;

            wrapperEl.appendChild(numberInput);

            controlDictionary.set(fieldDescription.name, numberInput);
        }

    }
}

searchForm.onsubmit = (e) => {
    e.preventDefault();

    const searchParameters: ITicketSearchParameters = {
        dateFrom: dateFromInput.valueAsDate ?? dateNowUtc(),
        dateTo: dateToInput.valueAsDate ?? dateNowUtc(),
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
        email: emailInput.value,
        adults: 0,
        children: 0,
        infants: 0
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

    // соберем данные из динамических компонентов
    controlDictionary.forEach(
        (control, key) => {
            const fieldDescription = descriptionMap.get(key);

            if (fieldDescription.type === FieldType.Number && typeof searchParameters[key] === 'number') {
                (searchParameters[key] as number) = (control as HTMLInputElement).valueAsNumber;
            } else {
                throw new Error('Not implemented! Надо добавить другие типы для динамической генерации формы');
            }
        }
    );

    setUIEnabled(false);

    isSearching = true;

    contracts.searchTickets(searchParameters);
}

stopButton.onclick = () => {
    setUIEnabled(true);

    contracts.stopSearch();

    isSearching = false;
}

setUIEnabled(true);

async function start(): Promise<void> {
    const initialSettings = await contracts.getSettings();

    fillUI(initialSettings);
}

start();

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

function setUIEnabled(searching: boolean) {
    dateFromInput.readOnly = !searching;
    dateFromInput.disabled = !searching;

    dateToInput.readOnly = !searching;
    dateToInput.disabled = !searching;

    directionsTextArea.readOnly = !searching;
    directionsTextArea.disabled = !searching;

    waitTimeFromInput.readOnly = !searching;
    waitTimeFromInput.disabled = !searching;

    waitTimeToInput.readOnly = !searching;
    waitTimeToInput.disabled = !searching;

    searchButton.disabled = !searching;
    searchButton.hidden = !searching;

    stopButton.hidden = searching;
    searchButton.hidden = !searching;
}

function fillUI(initialSettings: ITicketSearchParameters) {
    console.log('fill UI', initialSettings);
    
    dateFromInput.valueAsDate = initialSettings.dateFrom;
    dateToInput.valueAsDate = initialSettings.dateTo;

    directionsTextArea.value = stringifyDirections(initialSettings.directions);

    waitTimeFromInput.valueAsNumber = initialSettings.delayMin;
    waitTimeToInput.valueAsNumber = initialSettings.delayMax;
}

searchForm.onsubmit = (e) => {
    e.preventDefault();

    const searchParameters: ITicketSearchParameters = {
        dateFrom: dateFromInput.valueAsDate ?? new Date(),
        dateTo: dateToInput.valueAsDate ?? new Date(),
        directions: parseDirections(directionsTextArea.value),
        delayMin: waitTimeFromInput.valueAsNumber,
        delayMax: waitTimeToInput.valueAsNumber
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

    debugger;
    fillUI(initialSettings);
}

start();

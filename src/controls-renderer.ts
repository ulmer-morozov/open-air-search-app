import { getInputById, getTextareaById, cleanDirections, getElementById, parseDirections } from './browser-utils';
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

const initialDateFrom = new Date();
const initialDateTo = new Date();
initialDateTo.setDate(initialDateFrom.getDate() + 1)

dateFromInput.valueAsDate = initialDateFrom;
dateToInput.valueAsDate = initialDateTo;

directionsTextArea.value = cleanDirections(`
MSQ TBS  
 MSQ  KUT 

    MSQ   BUS 
`);

directionsTextArea.onchange = () => {
    directionsTextArea.value = cleanDirections(directionsTextArea.value);
}

waitTimeFromInput.valueAsNumber = 1000;
waitTimeToInput.valueAsNumber = 5000;

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

searchForm.onsubmit = (e) => {
    e.preventDefault();

    const searchParameters: ITicketSearchParameters = {
        dateFrom: dateFromInput.valueAsDate ?? new Date(),
        dateTo: dateFromInput.valueAsDate ?? new Date(),
        directions: parseDirections(directionsTextArea.value),
        delayMin: waitTimeFromInput.valueAsNumber,
        delayMax: waitTimeToInput.valueAsNumber
    };

    if (searchParameters.directions.length === 0) {
        alert('Empty directions');
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

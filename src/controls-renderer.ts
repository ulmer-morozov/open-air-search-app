import { getInputById, getTextareaById, cleanDirections, getElementById } from './browser-utils';
import "./controls.scss";

const searchForm = getElementById('searchForm', HTMLFormElement);

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
 MSQ  TBS 

    MSQ   BUS 
`);

waitTimeFromInput.valueAsNumber = 1000;
waitTimeToInput.valueAsNumber = 5000;

searchForm.onsubmit = e => {
    alert('submit');
}
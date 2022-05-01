let getFormattedTime = () => {
    const milliSecondsInMinute = 60000;
    let currentDateTime = new Date();
    let twentyMinutesFromNow = new Date(currentDateTime.getTime() + 20 * milliSecondsInMinute)
    return `${String(twentyMinutesFromNow.getHours()).padStart(2, '0')}:${String(twentyMinutesFromNow.getMinutes()).padStart(2, '0')}`;
}
let getNumberOfMinutesFromTimeString = (timeString) => {
    let hours = parseInt(timeString.substring(0, 2));
    let minutes = parseInt(timeString.substring(3, 5));
    return hours * 60 + minutes;
}
const [minMinutes, maxMinutes] = [getNumberOfMinutesFromTimeString(getFormattedTime()), 23 * 60 + 59];
let today = new Date();
let [currentMinutes, currentHours] = [today.getMinutes(), today.getHours()];
let maxOffsetInMinutes = (23 * 60 + 59) - (currentHours * 60 + currentMinutes);
let minOffsetInMinutes = 20;
console.log(`current mins: ${currentMinutes}, current hours: ${currentHours}, maxOffset ${maxOffsetInMinutes}`)
let min = 99999999;
let max = 0;
let calculateTimeAfterOffset = (hours, minutes, minutesOffset) => {
    let minutesToAdd = minutesOffset % 60;
    let hoursToAdd = Math.floor(minutesOffset / 60);
    let newMinutes, newHours;
    if (minutes + minutesToAdd > 59) {
        hoursToAdd++;
        newMinutes = (minutes + minutesToAdd) % 60;
    } else {
        newMinutes = minutes + minutesToAdd;
    }
    newHours = hours + hoursToAdd;
    return (`${newHours}:${newMinutes}`)
}
for (let i = 0; i < 100000; i++) {
    let minutesOffset = Math.floor((maxOffsetInMinutes - minOffsetInMinutes + 1) * Math.random()) + minOffsetInMinutes;
    if (minutesOffset > max)
        max = minutesOffset;
    if (minutesOffset < min)
        min = minutesOffset;
}
console.log(`min is ${min}, ${calculateTimeAfterOffset(currentHours, currentMinutes, min)}`)
console.log(`max is ${max}, ${calculateTimeAfterOffset(currentHours, currentMinutes, max)}`)

/*
This was probably a bad choice of min and max values. In javascript when I construct a date I can specify either a milliseconds from epoch value or a formatted date time string.
If I use what I'm using right now I'm calculating the offset from the hour 00:00 of the day which is not something convenient to calculate.
This means I'd have to create a formatted string for a constructor and at that point I'd just be doing all the work myself.
I think an easier approach is to just consider the offset in minutes from 20 minutes from now to the end of the day (23*60+59 - currentTimeInMinutes) so that afterwards 
I can just get the current Date in ms since epoch, add the offset in minutes * 60000 and have it formatted by js.
*/


let addMinutesOffsetToTime = (hours, minutes, minutesOffset) => {
    let newMinutes;
    let newHours = hours;
    if (minutes + minutesOffset % 60 > 59) {
        newHours++;
        newMinutes = (minutes + minutesOffset % 60) % 60;
    } else {
        newMinutes = minutes + minutesOffset % 60;
    }
    newHours += Math.floor(minutesOffset / 60)
    return (`${newHours}:${newMinutes}`)
}
// add(20, 10, 151)
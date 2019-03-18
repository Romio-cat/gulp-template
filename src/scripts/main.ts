import { sayHello } from "./greet";

function showHello(divName: string, name: string) {
    const elt = document.getElementById(divName);
    elt.innerText = sayHello(name);
}

console.log(sayHello('Roma'));

showHello("greeting", "TypeScript");

const elt = document.getElementById('greeting');

window.setTimeout(function () {
    elt.textContent = 'changed';
}, 5000);
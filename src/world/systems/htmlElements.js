import { KEYS, PDA_MENU_NAMES } from "./ui/uiConstants";

const container = document.querySelector('#scene-container');
const header = document.querySelector('#sceneTitle');
const msg = document.querySelector('#msg');
const manual = document.querySelector('#manual');
const infosDomElements = {
    header,
    msg,
    manual
};

function createPdaContainer(theme) {

    const pdaContainer = document.createElement('div');
    pdaContainer.setAttribute('name', 'pda-container');
    pdaContainer.classList.add(theme);

    return { pdaContainer };

}

function createPdaMenu() {

    const menu = document.createElement('div');
    menu.setAttribute('name', 'pda-menu');

    const menuUl = document.createElement('ul');
    const menuLiLeft = document.createElement('li');
    const menuLiCenter = document.createElement('li');
    const menuLiRight = document.createElement('li');

    menuLiLeft.classList.add('left');
    menuLiCenter.classList.add('center');
    menuLiRight.classList.add('right');    

    menuUl.append(menuLiLeft, menuLiCenter, menuLiRight);

    const menuLeftBtn = document.createElement('div');
    const menuRightBtn = document.createElement('div');
    menuLeftBtn.innerText = KEYS.Q;
    menuRightBtn.innerText = KEYS.E;

    const menuLeftText = document.createElement('div');
    const menuRightText = document.createElement('div');
    menuLeftText.innerText = PDA_MENU_NAMES[0];
    menuRightText.innerText = PDA_MENU_NAMES[2];

    menuLiLeft.append(menuLeftBtn, menuLeftText);
    menuLiRight.append(menuRightBtn, menuRightText);

    const menuCenterDivMain = document.createElement('div');
    menuCenterDivMain.innerText = PDA_MENU_NAMES[1];
    const menuCenterDivBottom = document.createElement('div');
    const menuCenterDots = [];
    for (let i = 0; i < 3; i++) {

        const dot = document.createElement('span');
        menuCenterDots.push(dot);

    }

    menuCenterDots[1].classList.add('current');
    menuCenterDivBottom.append(...menuCenterDots);

    menuLiCenter.append(menuCenterDivMain, menuCenterDivBottom);

    menu.appendChild(menuUl);

    return { menu, menuUl, menuLiLeft, menuLiRight, menuLiCenter, menuCenterDivMain, menuCenterDots };

}

function getScenePosition() {
    const sceneCanvas = container.querySelector('canvas');
    const rect = sceneCanvas.getBoundingClientRect();

    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
    };

}

export {
    container, infosDomElements,
    createPdaContainer,
    createPdaMenu,
    getScenePosition 
}
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
    pdaContainer.classList.add(theme, 'hidden');

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

function createMap() {

    const mapsContainer = document.createElement('div');
    mapsContainer.setAttribute('name', 'pda-maps');

    return { mapsContainer };
    
}

function createFiles() {

    const filesContainer = document.createElement('div');
    filesContainer.setAttribute('name', 'pda-files');

    return { filesContainer };

}

function createInventory() {

    const inventoryContainer = document.createElement('div');
    inventoryContainer.setAttribute('name', 'pda-inventory');

    const inventoryPanel = document.createElement('div');
    inventoryPanel.classList.add('inventory-panel');

    const slotsPanel = document.createElement('div');
    slotsPanel.classList.add('slots-panel');

    const itemsPanel = document.createElement('div');
    itemsPanel.classList.add('items-panel');

    const descriptionPanel = document.createElement('div');
    descriptionPanel.classList.add('description-panel');

    const slotsDivList = [];
    for (let i = 0; i < 20; i++) {

        const slot = document.createElement('div');
        slot.setAttribute('idx', i);
        slot.classList.add('slot');

        const slotContent = document.createElement('div');
        slotContent.classList.add('slot-content');

        const crossline0 = document.createElement('span');
        const crossline1 = document.createElement('span');
        crossline0.classList.add('crossline', 'cross-0');
        crossline1.classList.add('crossline', 'cross-1');

        slotContent.append(crossline0, crossline1);
        slot.appendChild(slotContent);
        slotsDivList.push(slot);

    }
    slotsPanel.append(...slotsDivList);

    const itemsDivList = [];

    inventoryPanel.append(slotsPanel, itemsPanel, descriptionPanel);
    inventoryContainer.appendChild(inventoryPanel);

    return { inventoryContainer, inventoryPanel, slotsPanel, itemsPanel, descriptionPanel, slotsDivList, itemsDivList }

}

function createInventoryItem(specs) {

    const { itemSize = 1, imgUrl } = specs;

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('inv-item', `item-size-${itemSize}`);
    itemDiv.style.position = 'absolute';

    const itemImg = document.createElement('div');
    itemImg.classList.add('item-img');
    itemImg.style.backgroundImage = `url("${imgUrl}")`;

    const equipInfo = document.createElement('div');
    equipInfo.innerText = 'E';
    equipInfo.classList.add('equip-info', 'hide');

    const countInfo = document.createElement('div');
    countInfo.classList.add('count-info');

    itemImg.append(equipInfo, countInfo);
    itemDiv.append(itemImg);

    return { itemDiv, equipInfo, countInfo };

}

function createECG(specs) {

    const { url } = specs;
    const ecgDiv = document.createElement('div');
    ecgDiv.classList.add('ecg');

    const pulseWave = document.createElement('div');
    pulseWave.classList.add('pulse-wave');
    pulseWave.style.backgroundImage = `url("${url}")`;

    const stateText = document.createElement('div');
    stateText.classList.add('state');

    ecgDiv.append(pulseWave, stateText);

    return { ecgDiv, pulseWave, stateText };

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
    createInventory,
    createInventoryItem,
    createECG,
    createMap,
    createFiles,
    getScenePosition 
}
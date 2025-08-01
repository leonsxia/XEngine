import { KEYS, PDA_MENU_NAMES, PDA_OPERATE_MENU_LIST } from "./ui/uiConstants";

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
    pdaContainer.toggleAttribute('pda-container');
    pdaContainer.classList.add(theme, 'hidden');

    return { pdaContainer };

}

function createPdaMenu() {

    const menu = document.createElement('div');
    menu.toggleAttribute('pda-menu');

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
    mapsContainer.toggleAttribute('pda-maps');

    return { mapsContainer };
    
}

function createFiles() {

    const filesContainer = document.createElement('div');
    filesContainer.toggleAttribute('pda-files');

    return { filesContainer };

}

function createInventory() {

    const inventoryContainer = document.createElement('div');
    inventoryContainer.toggleAttribute('pda-inventory');

    const inventoryPanel = document.createElement('div');
    inventoryPanel.classList.add('inventory-panel', 'popup-panel');

    const slotsPanel = document.createElement('div');
    slotsPanel.classList.add('slots-panel');

    const itemsPanel = document.createElement('div');
    itemsPanel.classList.add('items-panel');

    const operatePanel = document.createElement('div');
    operatePanel.classList.add('operate-panel');

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

    const focusedDiv = document.createElement('div');
    focusedDiv.classList.add('focused-item', 'idx-0', 'item-size-1');

    const focusedSlot = document.createElement('div');
    focusedSlot.classList.add('focused-slot');

    const operateMenuList = document.createElement('ul');
    const equipMenuItem = document.createElement('li');
    const useMenuItem = document.createElement('li');
    const combineMenuItem = document.createElement('li');
    const discardMenuItem = document.createElement('li');
    const examineMenuItem = document.createElement('li');
    operateMenuList.classList.add('operate-menu-list', 'popup-panel', 'hidden');
    equipMenuItem.classList.add('operate-menu-item');
    useMenuItem.classList.add('operate-menu-item');
    combineMenuItem.classList.add('operate-menu-item');
    discardMenuItem.classList.add('operate-menu-item');
    examineMenuItem.classList.add('operate-menu-item');
    equipMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.EQUIP;
    useMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.USE;
    examineMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.EXAMINE;
    combineMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.COMBINE;
    discardMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.DISCARD;    
    operateMenuList.append(equipMenuItem, useMenuItem, examineMenuItem, combineMenuItem, discardMenuItem);

    focusedDiv.append(focusedSlot, operateMenuList);
    operatePanel.append(focusedDiv);

    const operateMenuItems = {
        equipMenuItem,
        useMenuItem,
        combineMenuItem,
        discardMenuItem,
        examineMenuItem
    };

    const shiftSlot = document.createElement('div');
    shiftSlot.classList.add('shift-slot', 'item-size-1', 'hide');
    operatePanel.append(shiftSlot);

    inventoryPanel.append(slotsPanel, operatePanel, itemsPanel, descriptionPanel);
    inventoryContainer.appendChild(inventoryPanel);

    return { 
        inventoryContainer, inventoryPanel, slotsPanel, operatePanel, itemsPanel, descriptionPanel, 
        slotsDivList, itemsDivList, 
        focusedDiv, focusedSlot, shiftSlot,
        operateMenuList, operateMenuItems
    }

}

function createInventoryItem(specs) {

    const { itemSize = 1, imgUrl, isWeaponItem = false, needCountInfo = true } = specs;

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('inv-item', `item-size-${itemSize}`);

    const itemImg = document.createElement('img');
    itemImg.classList.add('item-img');
    itemImg.src = imgUrl;
    itemImg.setAttribute('alt', 'item-img');
    itemDiv.append(itemImg);

    let equipInfo;
    if (isWeaponItem) {

        equipInfo = document.createElement('div');
        equipInfo.innerText = 'E';
        equipInfo.classList.add('equip-info', 'hide');
        itemDiv.append(equipInfo);

    }

    let countInfo;
    if (needCountInfo) {

        countInfo = document.createElement('div');
        countInfo.classList.add('count-info');
        itemDiv.append(countInfo);

    }

    return { itemDiv, equipInfo, countInfo };

}

function createECG(specs) {

    const { url } = specs;
    const ecgDiv = document.createElement('div');
    ecgDiv.classList.add('ecg');

    const pulseWave = document.createElement('img');
    pulseWave.classList.add('pulse-wave');
    pulseWave.src = url;
    pulseWave.setAttribute('alt', 'pulse-wave');

    const sweep = document.createElement('div');
    sweep.classList.add('sweep');

    const stateText = document.createElement('div');
    stateText.classList.add('state');

    ecgDiv.append(pulseWave, sweep, stateText);

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
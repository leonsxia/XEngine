import { KEYS, PDA_HINT_GROUP, PDA_MENU_NAMES, PDA_OPERATE_MENU_LIST } from "./ui/uiConstants";

const container = document.querySelector('#scene-container');
const header = document.querySelector('#sceneTitle');
const msg = document.querySelector('#msg');
const infosDomElements = {
    header,
    msg
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

    const fileNavigatorBar = document.createElement('ul');
    const navLeft = document.createElement('li');
    const navCenter = document.createElement('li');
    const navRight = document.createElement('li');
    const navLeftBtn = document.createElement('div');
    const navRightBtn = document.createElement('div');
    const categoryList = [];

    for (let i = 0; i < 3; i++) {

        const categorySpan = document.createElement('span');
        if (i === 1) categorySpan.classList.add('center');
        categoryList.push(categorySpan);

    }

    fileNavigatorBar.classList.add('file-top-nav');
    navLeft.classList.add('file-top-nav-left');
    navCenter.classList.add('file-top-nav-center');
    navRight.classList.add('file-top-nav-right');

    navLeftBtn.innerText = KEYS.Z;
    navRightBtn.innerText = KEYS.C;

    navLeft.appendChild(navLeftBtn);
    navRight.appendChild(navRightBtn);
    navCenter.append(...categoryList);
    fileNavigatorBar.append(navLeft, navCenter, navRight);

    const filePanel = document.createElement('div');
    const fileLeftNav = document.createElement('ul');
    const fileContent = document.createElement('div');
    const mainContent = document.createElement('p');
    const footer = document.createElement('div');
    filePanel.classList.add('file-panel');
    fileLeftNav.classList.add('file-left-nav');
    fileContent.classList.add('file-content');
    mainContent.classList.add('main-content');
    footer.classList.add('footer');
    fileContent.append(mainContent, footer);
    filePanel.append(fileLeftNav, fileContent);

    const separator = document.createElement('div');
    separator.classList.add('separator');
    filesContainer.append(fileNavigatorBar, separator, filePanel);

    return {
        filesContainer,
        fileNavigatorBar, navLeftBtn, navRightBtn, categoryList,
        filePanel, fileLeftNav, fileContent, mainContent, footer
    };

}

function createFileLeftNavList(title, category) {

    const titleLi = document.createElement('li');
    titleLi.innerText = title;
    titleLi.setAttribute('category', category);

    return titleLi;

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

    const itemViewerPanel = document.createElement('div');
    itemViewerPanel.toggleAttribute('pda-item-viewer');
    itemViewerPanel.classList.add('popup-panel', 'hidden');

    // slot panel contents
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

    // operate panel contents
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

    const shiftDiv = document.createElement('div');
    shiftDiv.classList.add('shift-item', 'idx-0', 'item-size-1', 'hide');

    const shiftSlot = document.createElement('div');
    shiftSlot.classList.add('shift-slot');

    const shiftMenuList = document.createElement('ul');
    const shiftCombineMenuItem = document.createElement('li');
    const shiftSwapMenuItem = document.createElement('li');
    shiftMenuList.classList.add('operate-menu-list', 'popup-panel', 'hidden');
    shiftCombineMenuItem.classList.add('operate-menu-item');
    shiftSwapMenuItem.classList.add('operate-menu-item');
    shiftCombineMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.COMBINE;
    shiftSwapMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.SWAP;
    shiftMenuList.append(shiftCombineMenuItem, shiftSwapMenuItem);

    const shiftMenuItems = {
        shiftCombineMenuItem,
        shiftSwapMenuItem
    }

    shiftDiv.append(shiftSlot, shiftMenuList);
    operatePanel.append(shiftDiv);

    const selectDiv = document.createElement('div');
    selectDiv.classList.add('select-item', 'idx-0', 'item-size-1', 'hide');

    const selectSlot = document.createElement('div');
    selectSlot.classList.add('select-slot');

    selectDiv.append(selectSlot);
    operatePanel.append(selectDiv);

    // description panel contents
    const descriptionTitle = document.createElement('div');
    descriptionTitle.classList.add('description-title');
    const descriptionContent = document.createElement('div');
    descriptionContent.classList.add('description-content');
    const descriptionSeparater = document.createElement('div');
    descriptionSeparater.classList.add('description-separater');
    descriptionPanel.append(descriptionTitle, descriptionSeparater, descriptionContent);

    inventoryPanel.append(slotsPanel, operatePanel, itemsPanel, descriptionPanel);
    inventoryContainer.appendChild(inventoryPanel);

    return { 
        inventoryContainer, inventoryPanel, slotsPanel, operatePanel, itemsPanel, descriptionPanel, 
        itemViewerPanel,
        slotsDivList,
        focusedDiv, focusedSlot, shiftDiv, shiftSlot, selectDiv, selectSlot,
        operateMenuList, operateMenuItems, shiftMenuList, shiftMenuItems,
        descriptionTitle, descriptionContent
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

function createPdaHintElements(urls) {

    const { 
        btnViewUrl,
        btnDPadUpUrl, btnDPadDownUrl, btnDPadLeftUrl, btnDPadRightUrl,
        btnLStickClickUrl, btnRStickClickUrl,
        btnLTUrl, btnRTUrl
    } = urls;
    const hintPanel = document.createElement('div');
    hintPanel.toggleAttribute('pda-hints');

    const closeHint = document.createElement('div');
    const closeKey = document.createElement('span');
    const closeBtn = document.createElement('img');
    closeHint.classList.add('hint-group');
    closeKey.classList.add('hint-key');
    closeBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    closeKey.innerText = KEYS.TAB;
    closeBtn.src = btnViewUrl;
    closeHint.append(closeKey, closeBtn, PDA_HINT_GROUP.CLOSE.text);

    const confirmHint = document.createElement('div');
    const confirmKey = document.createElement('span');
    const confirmBtn = document.createElement('span');
    confirmHint.classList.add('hint-group');
    confirmKey.classList.add('hint-key');
    confirmBtn.classList.add('hint-btn', 'btn-A', 'hide');
    confirmKey.innerText = KEYS.J;
    confirmBtn.innerHTML = PDA_HINT_GROUP.CONFIRM.icon;
    confirmHint.append(confirmKey, confirmBtn, PDA_HINT_GROUP.CONFIRM.text);

    const cancelHint = document.createElement('div');
    const cancelKey = document.createElement('span');
    const cancelBtn = document.createElement('span');
    cancelHint.classList.add('hint-group');
    cancelKey.classList.add('hint-key');
    cancelBtn.classList.add('hint-btn', 'btn-B', 'hide');
    cancelKey.innerText = KEYS.K;
    cancelBtn.innerHTML = PDA_HINT_GROUP.CANCEL.icon;
    cancelHint.append(cancelKey, cancelBtn, PDA_HINT_GROUP.CANCEL.text);

    const moveHint = document.createElement('div');
    const moveKey = document.createElement('span');
    const moveBtn = document.createElement('span');
    moveHint.classList.add('hint-group');
    moveKey.classList.add('hint-key');
    moveBtn.classList.add('hint-btn', 'btn-X', 'hide');
    moveKey.innerText = KEYS.SHIFT;
    moveBtn.innerHTML = PDA_HINT_GROUP.MOVE.icon;
    moveHint.append(moveKey, moveBtn, PDA_HINT_GROUP.MOVE.text);

    const resetHint = document.createElement('div');
    const resetKey = document.createElement('span');
    const resetBtn = document.createElement('span');
    resetHint.classList.add('hint-group');
    resetKey.classList.add('hint-key');
    resetBtn.classList.add('hint-btn', 'btn-X', 'hide');
    resetKey.innerText = KEYS.SHIFT;
    resetBtn.innerHTML = PDA_HINT_GROUP.RESET.icon;
    resetHint.append(resetKey, resetBtn, PDA_HINT_GROUP.RESET.text);

    const upHint = document.createElement('div');
    const upKey = document.createElement('span');
    const upBtn = document.createElement('img');
    upHint.classList.add('hint-group');
    upKey.classList.add('hint-key');
    upBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    upKey.innerText = KEYS.W;
    upBtn.src = btnDPadUpUrl;
    upHint.append(upKey, upBtn, PDA_HINT_GROUP.UP.text);

    const downHint = document.createElement('div');
    const downKey = document.createElement('span');
    const downBtn = document.createElement('img');
    downHint.classList.add('hint-group');
    downKey.classList.add('hint-key');
    downBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    downKey.innerText = KEYS.S;
    downBtn.src = btnDPadDownUrl;
    downHint.append(downKey, downBtn, PDA_HINT_GROUP.DOWN.text);

    const leftHint = document.createElement('div');
    const leftKey = document.createElement('span');
    const leftBtn = document.createElement('img');
    leftHint.classList.add('hint-group');
    leftKey.classList.add('hint-key');
    leftBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    leftKey.innerText = KEYS.A;
    leftBtn.src = btnDPadLeftUrl;
    leftHint.append(leftKey, leftBtn, PDA_HINT_GROUP.LEFT.text);

    const rightHint = document.createElement('div');
    const rightKey = document.createElement('span');
    const rightBtn = document.createElement('img');
    rightHint.classList.add('hint-group');
    rightKey.classList.add('hint-key');
    rightBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    rightKey.innerText = KEYS.D;
    rightBtn.src = btnDPadRightUrl;
    rightHint.append(rightKey, rightBtn, PDA_HINT_GROUP.RIGHT.text);

    const rotateHint = document.createElement('div');
    const rotateUpKey = document.createElement('span');
    const rotateDownKey = document.createElement('span');
    const rotateLeftKey = document.createElement('span');
    const rotateRightKey = document.createElement('span');
    const rotateBtn = document.createElement('img');
    rotateHint.classList.add('hint-group');
    rotateUpKey.classList.add('hint-key');
    rotateDownKey.classList.add('hint-key');
    rotateLeftKey.classList.add('hint-key');
    rotateRightKey.classList.add('hint-key');
    rotateBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    rotateUpKey.innerText = KEYS.W;
    rotateDownKey.innerText = KEYS.S;
    rotateLeftKey.innerText = KEYS.A;
    rotateRightKey.innerText = KEYS.D;
    rotateBtn.src = btnLStickClickUrl;
    rotateHint.append(rotateLeftKey, rotateRightKey, rotateUpKey, rotateDownKey, rotateBtn, PDA_HINT_GROUP.ROTATE.text);

    const zoomHint = document.createElement('div');
    const zoomInKey = document.createElement('span');
    const zoomOutKey = document.createElement('span');
    const zoomBtn = document.createElement('img');
    zoomHint.classList.add('hint-group');
    zoomInKey.classList.add('hint-key');
    zoomOutKey.classList.add('hint-key');
    zoomBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    zoomInKey.innerText = KEYS.E;
    zoomOutKey.innerText = KEYS.Q;
    zoomBtn.src = btnRStickClickUrl;
    zoomHint.append(zoomOutKey, zoomInKey, zoomBtn, PDA_HINT_GROUP.ZOOM.text);

    const changeFileGroupHint = document.createElement('div');
    const leftFileGroupKey = document.createElement('span');
    const rightFileGroupKey = document.createElement('span');
    const leftFileGroupBtn = document.createElement('img');
    const rightFileGroupBtn = document.createElement('img');
    changeFileGroupHint.classList.add('hint-group');
    leftFileGroupKey.classList.add('hint-key');
    rightFileGroupKey.classList.add('hint-key');
    leftFileGroupBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    rightFileGroupBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    leftFileGroupKey.innerText = KEYS.Z;
    rightFileGroupKey.innerText = KEYS.C;
    leftFileGroupBtn.src = btnLTUrl;
    rightFileGroupBtn.src = btnRTUrl;
    changeFileGroupHint.append(leftFileGroupKey, rightFileGroupKey, leftFileGroupBtn, rightFileGroupBtn, PDA_HINT_GROUP.CHANGE_FILE_GROUP.text);

    const flipPageHint = document.createElement('div');
    const leftFlipPageKey = document.createElement('span');
    const rightFlipPageKey = document.createElement('span');
    const leftFlipPageBtn = document.createElement('img');
    const rightFlipPageBtn = document.createElement('img');
    flipPageHint.classList.add('hint-group');
    leftFlipPageKey.classList.add('hint-key');
    rightFlipPageKey.classList.add('hint-key');
    leftFlipPageBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    rightFlipPageBtn.classList.add('hint-btn', 'btn-svg', 'hide');
    leftFlipPageKey.innerText = KEYS.A;
    rightFlipPageKey.innerText = KEYS.D;
    leftFlipPageBtn.src = btnDPadLeftUrl;
    rightFlipPageBtn.src = btnDPadRightUrl;
    flipPageHint.append(leftFlipPageKey, rightFlipPageKey, leftFlipPageBtn, rightFlipPageBtn, PDA_HINT_GROUP.FLIP_PAGES.text);

    return {
        hintPanel,
        closeHint, closeKey, closeBtn,
        confirmHint, confirmKey, confirmBtn,
        cancelHint, cancelKey, cancelBtn,
        moveHint, moveKey, moveBtn,
        resetHint, resetKey, resetBtn,
        upHint, upKey, upBtn,
        downHint, downKey, downBtn,
        leftHint, leftKey, leftBtn,
        rightHint, rightKey, rightBtn,
        rotateHint, rotateLeftKey, rotateRightKey, rotateUpKey, rotateDownKey, rotateBtn,
        zoomHint, zoomOutKey, zoomInKey, zoomBtn,
        changeFileGroupHint, leftFileGroupKey, rightFileGroupKey, leftFileGroupBtn, rightFileGroupBtn,
        flipPageHint, leftFlipPageKey, rightFlipPageKey, leftFlipPageBtn, rightFlipPageBtn
    };

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
    createFileLeftNavList,
    createPdaHintElements,
    getScenePosition 
}
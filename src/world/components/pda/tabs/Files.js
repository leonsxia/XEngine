import { createFileLeftNavList, createFiles } from "../../../systems/htmlElements";
import { ELEMENT_CLASS, GAMEPAD_BUTTONS, KEYS } from "../../../systems/ui/uiConstants";
import { CONTROL_TYPES } from "../../utils/constants";
import { JSON_NAMES } from "../../utils/documentary";
import { addElementClass, clearChildren, removeElementClass } from "../../utils/htmlHelper";
import { loadedImages } from "../../utils/imageHelper";
import { getJson } from "../../utils/jsonHelper";
import { format } from "../../utils/stringHelper";
import { TabPanel } from "./TabPanel";

class Files extends TabPanel {

    _json;
    _category = [];
    _currentCategoryIdx = 0;
    _categoryTabs = [];
    _categoryTabIdx = 0;
    _files = [];
    _filesNavList = [];
    _filesNavSize = 10;
    _currentFileIdx = 0;
    _currentPageIdx = 0;
    _filesNavIdx = 0;

    constructor(specs) {

        super(specs);

        this._html = createFiles();

    }

    async init() {

        this._json = await getJson(JSON_NAMES.FILES);

        this.createFilesNavList();
        this._category = this._json.fileGroups.map(g => g.category);

    }

    createFilesNavList() {

        const fileGroups = this._json.fileGroups;
        for (let i = 0, il = fileGroups.length; i < il; i++) {

            const group = fileGroups[i];
            const { category, files } = group;
            const groupFiles = {
                category, navList: []
            };

            files.sort((a, b) => a.order - b.order);
            for (let j = 0, jl = files.length; j < jl; j++) {

                const file = files[j];
                const fileNavItem = createFileLeftNavList(file.title, category);
                groupFiles.navList.push(fileNavItem);

                file.pages.sort((a, b) => a.index - b.index);

            }

            this._filesNavList.push(groupFiles);

        }

    }

    get categoryTabIndex() {

        return this._categoryTabIdx;

    }

    set categoryTabIndex(val) {

         this._categoryTabIdx = Math.min(Math.max(val, 0), 2);

    }

    get currentCategoryIndex() {

        return this._currentCategoryIdx;

    }

    set currentCategoryIndex(val) {

        this._currentCategoryIdx = val > 0 ? val % this._category.length : (this._category.length + val) % this._category.length;       
        this.applyCategory();

    }

    get currentCategory() {

        return this._category[this._currentCategoryIdx];

    }

    get currentFileIndex() {

        return this._currentFileIdx;

    }

    set currentFileIndex(val) {

        this._currentFileIdx = Math.max(0, Math.min(val, this._files.length - 1));
        this.applyFileItems();

    }

    get filesNavIndex() {

        return this._filesNavIdx;

    }

    set filesNavIndex(val) {

        this._filesNavIdx = Math.max(0, Math.min(val, Math.min(this._filesNavSize - 1, this._files.length - 1)));

    }

    get currentFilePageSize() {

        return this._files[this._currentFileIdx].pages.length;

    }

    get currentPageIndex() {

        return this._currentPageIdx;

    }

    set currentPageIndex(val) {

        this._currentPageIdx = Math.max(0, Math.min(val, this.currentFilePageSize - 1));
        this.applyFileContent();

    }

    getCategoryTabs() {

        let startIdx;
        if (this._categoryTabIdx === 2 || this._categoryTabIdx === this._category.length) {

            if (this._currentCategoryIdx === 0) {

                startIdx = 0;
                this._categoryTabIdx = 0;

            } else {

                startIdx = this._currentCategoryIdx - 2;
                startIdx = startIdx < 0 ? this._category.length + startIdx : startIdx;

            }

        } else if (this._categoryTabIdx === 0) {

            startIdx = this._currentCategoryIdx;

        }

        if (startIdx !== undefined) {

            this._categoryTabs.length = 0;

            if (this._category.length > 0) {

                this._categoryTabs.push(this._category[startIdx]);

                if (this._category.length > 1) {

                    this._categoryTabs.push(this._category[(startIdx + 1) % this._category.length]);

                }

                if (this._category.length > 2) {

                    this._categoryTabs.push(this._category[(startIdx + 2) % this._category.length]);

                }

            }

        }

    }    

    applyCategory() {

        this.getCategoryTabs();
        const { categoryList } = this._html;
        for (let i = 0, il = categoryList.length; i < il; i++) {

            const li = categoryList[i];
            li.innerText = i < this._categoryTabs.length ? this._categoryTabs[i] : '';
            if (i === this._categoryTabIdx) {

                addElementClass(li, ELEMENT_CLASS.SELECTED);
                this.categoryTabIndex = i;

            } else {

                removeElementClass(li, ELEMENT_CLASS.SELECTED);

            }

        }

        this._files = this._json.fileGroups.find(g => g.category === this.currentCategory).files;
        this._currentFileIdx = 0
        this._filesNavIdx = 0;
        this.applyFileItems();

    }

    applyFileItems() {

        const fileLeftNavUl = this._html.fileLeftNav;        
        const navLength = Math.min(this._filesNavSize, this._files.length);
        let startIdx;
        if (this._filesNavIdx === 0) {

            startIdx = this._currentFileIdx;

        } else if (this._filesNavIdx === navLength - 1) {

            startIdx = this._currentFileIdx - navLength + 1;

        }

        const { navList } = this._filesNavList.find(fl => fl.category === this.currentCategory);
        if (startIdx !== undefined) {

            clearChildren(fileLeftNavUl);

            for (let i = 0; i < navLength; i++) {

                fileLeftNavUl.append(navList[startIdx + i]);

            }

        }
        
        for (let i = 0, il = navList.length; i < il; i++) {

            const navItem = navList[i];
            if (i === this._currentFileIdx) {

                addElementClass(navItem, ELEMENT_CLASS.SELECTED);
                this._currentPageIdx = 0;
                this.applyFileContent();

            } else {

                removeElementClass(navItem, ELEMENT_CLASS.SELECTED);

            }

        }

        if (navList.length === 0) {

            this._html.mainContent.innerHTML = '';

        }

    }

    applyFileContent() {

        const mainContentEl = this._html.mainContent;
        const footer = this._html.footer;
        const file = this._files[this._currentFileIdx];
        const { content, placeholder } = file.pages[this._currentPageIdx];
        let placeholderList = [];
        for (let i = 0, il = placeholder.length; i < il; i++) {

            const { type, src } = placeholder[i];
            switch (type) {
                case "image":

                    {
                        const url = loadedImages[src];
                        placeholderList.push(url);
                    }
                    break;

                default:

                    placeholderList.push(src);
                    break;

            }

        }

        mainContentEl.innerHTML = format(content, ...placeholderList);
        footer.innerText = `${this._currentPageIdx + 1} / ${this.currentFilePageSize}`;

    }

    switchControlType(type = CONTROL_TYPES.KEYBOARD) {

        switch (type) {

            case CONTROL_TYPES.KEYBOARD:

                this._html.navLeftBtn.innerText = KEYS.Z;
                this._html.navRightBtn.innerText = KEYS.C;
                break;

            case CONTROL_TYPES.XBOX:

                this._html.navLeftBtn.innerText = GAMEPAD_BUTTONS.LT;
                this._html.navRightBtn.innerText = GAMEPAD_BUTTONS.RT;
                break;

        }

    }

}

export { Files };
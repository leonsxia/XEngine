function removeElementClass(element, clsname) {

    let find = [];
    for (let i = 0, il = element.classList.length; i < il; i++) {

        const cls = element.classList[i];
        if (cls.includes(clsname)) {

            find.push(cls);

        }

    }

    for (let i = 0, il = find.length; i < il; i++) {

        const cls = find[i];
        element.classList.remove(cls);

    }

}

function addElementClass(element, clsname) {

    element.classList.add(clsname);

}

export { removeElementClass, addElementClass };
function removeElementClass(element, ...clsnames) {

    let find = [];
    for (let i = 0, il = element.classList.length; i < il; i++) {

        const cls = element.classList[i];

        for (let j = 0, jl = clsnames.length; j < jl; j++) {

            const clsname = clsnames[j];
            if (cls.includes(clsname)) {

                find.push(cls);
                break;

            }

        }

    }

    for (let i = 0, il = find.length; i < il; i++) {

        const cls = find[i];
        element.classList.remove(cls);

    }

}

function addElementClass(element, ...clsnames) {

    element.classList.add(...clsnames);

}

function findClass(element, clsname) {

    let find = [];
    for (let i = 0, il = element.classList.length; i < il; i++) {

        const cls = element.classList[i];
        if (cls.includes(clsname)) {

            find.push(cls);

        }

    }

    return find;

}

export { removeElementClass, addElementClass, findClass };
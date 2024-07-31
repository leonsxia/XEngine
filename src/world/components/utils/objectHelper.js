
function clone(target, source, ignore = []) {

    const properties = Object.getOwnPropertyNames(source).filter(prop => !ignore.find(i => i === prop));

    properties.forEach(prop => {

        if (!Array.isArray(source[prop]) && typeof source[prop] === 'object') {

            target[prop] = clone({}, source[prop]);

        } else {
            
            target[prop] = source[prop];
        }

    });

    return target;

}

function groupHasChild(group, child) {

    let has = false;

    if (group.children.length > 0) {

        for (let i = 0; i < group.children.length; i++) {

            const c = group.children[i];

            if (c.isGroup) {

                has = groupHasChild(c, child);

            } else if (c === child) {

                has = true;

            }

            if (has) return has;

        }
    }

    return has;

}

export { clone, groupHasChild };
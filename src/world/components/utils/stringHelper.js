function format(str, ...values) {

    return str.replace(/\{(\d+)\}/g, (match, index) => {

        return values[index] !== undefined ? values[index] : match;

    });

}

export { format };
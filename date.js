

exports.getDate = function() {
    const options = {
        weekday : "long",
        year: "numeric",
        day: "numeric",
        month: "long"
    };
    
    const today = new Date();
    return today.toLocaleDateString(undefined, options);
}

exports.getDay = function () {
    const options = {
        weekday : "long",
    };
    
    const today = new Date();
    return today.toLocaleDateString(undefined, options);
}

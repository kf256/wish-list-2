const wishes = [];
const properties = [];

class Wish {
    constructor() {
        this.name = "";
        this.description = "";
        this.properties = {};
        wishes.push(this);
    }
    
    get visible() {
        for (const key in this.properties) {
            if (Property.getByKey(key).visible(this.properties[key])) {
                console.log(this.name, key);
                return true;
            }
        }
        return false;
    }
}

class Property {
    constructor(key) {
        this.key = key;
        this.values = [];
        
        for (let p = 0; p < properties.length; p++) {
            if (properties[p] === key) throw "property '"+key+"' already exists";
        }
        properties.push(this);
    }
    
    addOption() {
        const id = Math.random();
        this.check = create("input", _div, null, {type: "checkbox", onchange: "showWishes()"});
        this.label = create("label", _div, this.key, {for: id});
        this.select = create("select", _div, null, {onchange: "showWishes()"});
        for (let v = 0; v < this.values.length; v++) {
            create("option", this.select, this.values[v], {value: v});
        }
        create("br", _div);
    }
    
    visible(value) {
        if (!this.check.checked) return false;
        return this.select.value == value;
    }
    
    static getByKey(key) {
        let result = null;
        properties.forEach((property) => {
            if (property.key === key) result = property;
        });
        return result;
    }
}

class Category extends Property {
    constructor(key) {
        super(key);
        this.values = [true, false];
    }
    
    addOption() {
        const id = Math.random();
        this.check = create("input", _div, null, {type: "checkbox", id: id, onchange: "showWishes()"});
        this.label = create("label", _div, this.key, {for: id});
        create("br", _div);
    }
    
    get value() {
        return this.check.checked;
    }
    visible(value) {
        return this.check.checked && value;
    }
}

function create(name, parent, html = null, attributes = null) {
    const elm = document.createElement(name);
    parent.appendChild(elm);
    if (html !== null) elm.innerHTML = html;
    if (attributes !== null) {
        for (let i = 0; i < Object.keys(attributes).length; i++) {
            elm.setAttribute(Object.keys(attributes)[i], Object.values(attributes)[i]);
        }
    }
    return elm;
}

new Property("mod 3").values = [0, 1, 2];
new Category("> 3");

for (let i = 1; i <= 6; i++) {
    const wish = new Wish();
    wish.name = "wish "+i;
    wish.description = "e.g. book about programming with JS";
    wish.properties["mod 3"] = (i % 3);
    wish.properties["> 3"] = (i > 3);
}

for (const p in properties) properties[p].addOption();
showWishes();

function showWishes() {
    _ul.innerHTML = "";
    for (const w in wishes) {
        const wish = wishes[w];
        if (!wish.visible) continue;
        create("li", _ul, wish.name);
    }
}
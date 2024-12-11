class Wish {
    constructor(name) {
        this.name = name;
        this.description = "";
        this.category = Category.start;
        this.properties = {};
        Wish.list.push(this);
        Property.update();
    }
    
    get visible() {
        for (const p in Property.list) {
            const property = Property.list[p];
            const value1 = this.properties[property.name];
            const value2 = property.value;
            console.log(value1, property.operator, value2);
            switch (property.operator) {
                case "≤": if (value1  > value2) return false; break;
                case "≥": if (value1  < value2) return false; break;
                case "=": if (value1 != value2) return false; break;
            }
        }
        return true;
    }
    
    static list = [];
}

class Category {
    constructor(name) {
        if (Category.findByName(name)) {
            console.error(`failed to create category: name "${name}" is already being used`);
            return;
        }
        this.name = name;
        this.category = Category.start;
        Category.list.push(this);
    }
    
    static findByName(name) {
        for (const c in Category.list) {
            const category = Category.list[c];
            if (category.name === name) return category;
        }
        return null;
    }
    
    static start = null;
    
    static list = [];
}
Category.start = new Category("start");

class Property {
    constructor(name) {
        if (Property.findByName(name)) {
            console.error(`failed to create property: name "${name}" is already being used`);
            return;
        }
        this.name = name;
        this.operator = null;
        this.value = null;
        Property.list.push(this);
        Property.update();
    }
    
    get min() {
        let min = Infinity;
        for (const w in Wish.list) {
            const value = Wish.list[w].properties[this.name];
            if (value < min) min = value;
        }
        return min;
    }
    
    get max() {
        let max = -Infinity;
        for (const w in Wish.list) {
            const value = Wish.list[w].properties[this.name];
            if (value > max) max = value;
        }
        return max;
    }
    
    static findByName(name) {
        for (const p in Property.list) {
            const property = Property.list[p];
            if (property.name === name) return property;
        }
        return null;
    }
    
    static update() {
        for (const w in Wish.list) {
            const wish = Wish.list[w];
            const oldProperties = wish.properties;
            const newProperties = {};
            for (const p in Property.list) {
                const property = Property.list[p];
                const oldValue = oldProperties[property.name];
                let newValue;
                if (oldValue === undefined) newValue = 0;
                else newValue = oldValue;
                newProperties[property.name] = newValue;
            }
            wish.properties = newProperties;
        }
    }
    
    static list = [];
}

let loc = Category.start;
let naviVisible = false;
let filtVisible = false;

naviButton.addEventListener("click", () => {
    naviVisible = !naviVisible;
    updateAll();
});
filtButton.addEventListener("click", () => {
    filtVisible = !filtVisible;
    updateAll();
});

fileDiv.addEventListener("click", async () => {
    const elm = create("input", null, null, {type: "file"});
    elm.click();
    await new Promise(r => elm.onchange = r);
    if (elm.files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(elm.files[0]);
    await new Promise(r => fileReader.onload = r);
    createFromString(fileReader.result);
});

{
    initAll();
    updateAll();
}

function initAll() {
    initFilt();
}

function updateAll() {
    updateList();
    updatePath();
    updateNavi();
    updateFilt();
}

function updateList() {
    if (loc instanceof Category) showCategory();
    else showWish();
}

function showCategory() {
    const elements = [];
    for (const c in Category.list) {
        const category = Category.list[c];
        if (category.category === loc) elements.push(category);
    }
    for (const w in Wish.list) {
        const wish = Wish.list[w];
        if (wish.category === loc && wish.visible) elements.push(wish);
    }
    
    listDiv.innerHTML = "";
    for (const e in elements) {
        const element = elements[e];
        const div = create("div", listDiv, element.name);
        if (element instanceof Category) div.classList.add("category");
        else div.classList.add("wish");
        div.addEventListener("click", () => {
            loc = element;
            updateAll();
        });
    }
}

function showWish() {
    listDiv.innerHTML = "";
    const div = create("div", listDiv, loc.description, {class: "description"});
}

function updatePath() {
    const path = [];
    path.push(loc);
    while (path[0] !== Category.start) path.unshift(path[0].category);
    
    pathDiv.innerHTML = "";
    for (const p in path) {
        if (p != 0) create("span", pathDiv, "/");
        const elm = create("div", pathDiv, path[p].name);
        if (path[p] === loc) elm.style.backgroundColor = "#ccf";
        elm.addEventListener("click", () => {
            loc = path[p];
            updateAll();
        });
    }
}

function updateNavi() {
    naviDiv.style.width = naviVisible ? "200px" : "0px";
    naviButton.innerHTML = naviVisible ? "⛌" : "☰";
    
    naviList.innerHTML = "";
    list(Category.start, 0);
    
    function list(category, depth) {
        const elm = create("div", naviList, category.name);
        elm.style.marginLeft = depth * 10 + "px";
        if (loc instanceof Category && category === loc) elm.style.backgroundColor = "#ccf";
        if (loc instanceof Wish && category === loc.category) elm.style.backgroundColor = "#ccf";
        elm.addEventListener("click", () => {
            loc = category;
            updateAll();
        });
        
        for (const c in Category.list) {
            const subcategory = Category.list[c];
            if (subcategory.category === category) list(subcategory, depth+1);
        }
    }
}

function updateFilt() {
    filtDiv.style.width = filtVisible ? "200px" : "0px";
    filtButton.innerHTML = filtVisible ? "⛌" : "☰";
}

function initFilt() {
    filtList.innerHTML = "";
    for (const p in Property.list) {
        const property = Property.list[p];
        const min = property.min;
        const max = property.max;
        
        const div = create("div", filtList, null);
        const line1 = create("div", div, null);
        create("span", line1, property.name);
        
        const operator = create("span", line1, "≥", {class: "operator"});
        operator.addEventListener("click", () => {
            let newOperator;
            switch (operator.innerHTML) {
                case "≥": newOperator = "≤"; break;
                case "≤": newOperator = "="; break;
                case "=": newOperator = "≥"; break;
            }
            operator.innerHTML = newOperator;
            property.operator = newOperator;
            updateAll();
        });
        property.operator = "≥";
        
        const out = create("span", line1, min);
        const range = create("input", div, null, {type: "range", class: "slider", min: min, max: max, value: min});
        range.addEventListener("input", () => {
            out.innerHTML = range.value;
            property.value = range.value;
            updateAll();
        });
        property.value = min;
    }
}

function create(name, parent = null, html = null, attributes = null) {
    const elm = document.createElement(name);
    if (parent !== null) parent.appendChild(elm);
    if (html !== null) elm.innerHTML = html;
    if (attributes !== null) {
        for (let i = 0; i < Object.keys(attributes).length; i++) {
            elm.setAttribute(Object.keys(attributes)[i], Object.values(attributes)[i]);
        }
    }
    return elm;
}

function convertToString() {
    const properties = [];
    for (const p in Property.list) properties.push(Property.list[p].name);
    
    const categories = [];
    for (const c in Category.list) {
        const category = Category.list[c];
        if (category === Category.start) continue;
        categories.push({name: category.name, category: category.category.name});
    }
    
    const wishes = [];
    for (const w in Wish.list) {
        const wish = Wish.list[w];
        wishes.push({
            name: wish.name,
            description: wish.description,
            category: wish.category.name,
            properties: wish.properties
        });
    }
    
    return JSON.stringify({
        version: "1.0",
        properties: properties,
        startName: Category.start.name,
        categories: categories,
        wishes: wishes
    });
}

function createFromString(string) {
    const obj = JSON.parse(string);
    
    Property.list = [];
    for (const p in obj.properties) new Property(obj.properties[p]);
    
    Category.list = [];
    Category.start = null;
    Category.start = new Category(obj.startName);
    for (const c in obj.categories) new Category(obj.categories[c].name);
    for (const c in obj.categories) {
        const category = Category.findByName(obj.categories[c].name);
        category.category = Category.findByName(obj.categories[c].category);
    }
    
    Wish.list = [];
    for (const w in obj.wishes) {
        const data = obj.wishes[w];
        const wish = new Wish(data.name);
        wish.description = data.description
        wish.category = Category.findByName(data.category);
        wish.properties = data.properties;
    }
    
    loc = Category.start;
    
    initAll();
    updateAll();
}
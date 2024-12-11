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

{
    const p1 = new Property("importance");
    const a = new Category("books");
    const a1 = new Category("non-fiction"); a1.category = a;
    const a2 = new Category("fiction"); a2.category = a;
    const b = new Category("examples");
    const b1 = new Wish("main example wish"); b1.category = b; b1.properties.importance = 1; b1.description = "<h1>Example</h1>This is an example description for an example wish. It is not intended to really describe something, rather to be a space-filler for seeing how this works. To test various elements, it contains a <a href='https://www.ecosia.org'>Link</a>, a <b>piece of bold text</b> and an image: <br> <img src='https://openclipart.org/download/20655/sheikh-tuhin-Christmas.svg' width='500px'></img> <br> There are also &lt;br&gt; elements before and after the image. I hope that everything works, so I can replace this long and boring text with an actual description of a real wish soon.";
    const b2 = new Wish("other example wish"); b2.category = b; b2.properties.importance = 0; b2.description = "<h1>Another example</h1><h2>What this actually is</h2>This is another example description. It is supposed to be much shorter and less complex, since it is not really supposed to show anything. But I like to write texts like this and since I can, I'm doing it here. So I think this text will actually get longer and longer without contributing to finishing this program. Instead, writing it will just make me lose time. Additionally, it doesn't have any long-term (or even short-term) purpose, so I will have to delete it soon.";
    initAll();
    updateAll();
}

function initAll() {
    initNavi();
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
}

function initNavi() {
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
    
    showEverything();
}
function useTemplate(template) {
    console.log(template);
}

function addActionButtons() {
    const toolbox = document.querySelectorAll(".widget-toolbox > .pull-left")[0];

    const featBtn = document.createElement("a");
    featBtn.classList.add("btn", "btn-primary", "btn-black", "btn-round", "btn-sm");
    featBtn.innerHTML = "To GitHub feature";

    const bugBtn = document.createElement("a");
    bugBtn.classList.add("btn", "btn-primary", "btn-black", "btn-round", "btn-sm");
    bugBtn.innerHTML = "To GitHub bug";

    toolbox.appendChild(featBtn);
    toolbox.appendChild(bugBtn);

    featBtn.addEventListener("click", e => {
        useTemplate("feature_request.md");
    });

    bugBtn.addEventListener("click", e => {
        useTemplate("bug_report.md");
    })
}

function getTableField(field) {
    const items = document.querySelectorAll(".bug-" + field);
    
    if (items.length !== 2) {
        console.log("Could not get table field " + field + " because items is", items);
        return null;
    }
    return items[1].textContent.trim();
}

function isLoggedIn() {
    const list = document.querySelectorAll("a[href='/account_page.php']");
    return list.length > 0;
}

function getBugData() {
    return {
        status: getTableField("status"),
    };
}

function main() {
    // Don't run our code on the wrong pages
    if (location.pathname !== "/view.php") {
        console.log("Not on view.php page")
        return;
    }

    // Check if logged in
    if (!isLoggedIn()) {
        console.log("Not logged in");
        return;
    }

    let urlParams = new URLSearchParams(window.location.search);
    const bugID = urlParams.get('id');

    addActionButtons();

    const data = getBugData();
    console.log("Data", data);
}

addEventListener("load", main);
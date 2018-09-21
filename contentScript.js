function buildGitHubBox(bugData) {
    // Clone the note box
    const notebox = document.querySelector("#bugnoteadd").parentElement;

    const cloned = notebox.cloneNode(true)
    
    // Remove a bunch of stuff we don't want!
    cloned.querySelectorAll("#addbugnote").outerHTML = "";

    // Rename some stuff
    cloned.querySelector("#bugnote_text").id = "githubissue_text";
    
    // Add style
    cloned.classList.add("mantismigrate-fixed");
    
    // Set title of new box to summat else
    const title = cloned.querySelector(".widget-title");
    title.innerHTML = "New GitHub issue"

    // Rejig private row to be a milestone checkbox
    const private = cloned.querySelector("table>tbody>tr:first-child");
    private.children[0].textContent = "Backlog milestone";
    let milestoneNote = "Dunno";
    if (bugData.status === "resolved" || bugData.status === "closed") {
        milestoneNote = "Why are you migrating a closed issue?";
    } else if (bugData.status === "confirmed") {
        milestoneNote = "YES YES";
    }
    const checkbox = private.children[1].querySelector("span").parentElement;
    const checkboxInput = checkbox.querySelector("input")
    checkboxInput.id = "mantismigrate-backlogit";
    checkboxInput.checked = (bugData.status === "confirmed");
    checkbox.setAttribute("for", "mantismigrate-backlogit");
    checkbox.querySelector("span").innerHTML = "<strong>" + milestoneNote + "</strong> (Rule of thumb: confirmed issues go into 'Backlog')";;

    // Change note to "description"
    const descrEl = cloned.querySelector("table>tbody>tr:nth-child(2)");
    descrEl.children[0].innerHTML = "Description";

    // Create a title obj
    const titleEl = document.createElement("tr");
    titleEl.innerHTML = `<th class=category>Title</th><td>
    <input type=text class="input-sm" style="width:100% !important"></input></td>`
    titleEl.querySelector("input").value = bugData.title;
    descrEl.parentNode.insertBefore(titleEl, descrEl);

    // Rejig attach files to be markdown guidance
    const attach = cloned.querySelector("#bugnote-attach-files")
    attach.id = "";
    attach.children[0].innerHTML = "Guidance";
    attach.children[1].innerHTML = `
Use <a href="https://guides.github.com/features/mastering-markdown/">GitHub Flavoured Markdown</a>. Lists and code should be well formatted.
<br>
You can syntax-highlight code by providing the language after the backticks, like so: \`\`\`lua
<br>
<strong>If a bug is confirmed</strong>, set the milestone on GitHub to "Backlog".
<br>
<strong>Once GH issue made: </strong>Paste the issue url below and click "comment & close".
    `;

    // Finally append
    notebox.parentElement.appendChild(cloned);

    const box = {
    };

    return box;
}

async function useTemplate(template, label) {
    const url = `https://raw.githubusercontent.com/multitheftauto/mtasa-blue/master/.github/ISSUE_TEMPLATE/${template}`
    
    let resp = await fetch(url);
    
    let val = await resp.text();

    // Skip yaml header + two newlines, slice the string
    const headerEnd = val.indexOf("---", 3) + 5;
    val = val.slice(headerEnd);

    // Get bug data
    const bugData = getBugData();

    // Build GitHub box
    const box = buildGitHubBox(bugData);

    // Build new url
    const buildURL = (title, body, assignee, withMilestone) => {
        let url = "https://github.com/multitheftauto/mtasa-blue/issues/new?"
        if (withMilestone) {
            url += "milestone=Backlog&";
        }
        if (label) {
            url += `labels=${encodeURIComponent(label)}&`;
        }
        if (assignee) {
            url += `assignee=${encodeURIComponent(assignee)}&`;
        }
        url += `title=${encodeURIComponent(title)}&`;
        url += `title=${encodeURIComponent(body)}&`;
    }
    
    // Set box callbacks
    box.onCreateIssue = (title, body, withMilestone) => {
        const url = buildURL(title, body, "qaisjp", withMilestone);
        window.open(url);
    }
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
        useTemplate("feature_request.md", "enhancement");
    });

    bugBtn.addEventListener("click", e => {
        useTemplate("bug_report.md", "bug");
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
console.log("mantismigrate running");
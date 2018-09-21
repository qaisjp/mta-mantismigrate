function buildGitHubBox(bugData, templateText) {
    const box = {
        onCreateIssue: (title, body, withMilestone) => {},
        // getOpenedURL: () => "",
        onFinishIssue: (url) => {},
    };

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
    descrEl.children[1].children[0].value = templateText;

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

    // Grab the submit button and replace it
    cloned.querySelector("input[type='submit']").outerHTML = `
        <button id="mantismigrate-createissue" class="btn btn-primary btn-white btn-round">
            Create issue on GitHub
        </button>
        <span id="mantismigrate-finishup">
            <input type=text style="width:60%!important;" placeholder="FILL ME IN https://github.com/multitheftauto/mtasa-blue/issue/100">
            <button class="btn btn-primary btn-white btn-round">
            Leave comment
            </button>
        </span>
    `

    cloned.querySelector("#mantismigrate-createissue").addEventListener("click", e => {
        e.preventDefault();
        box.onCreateIssue(
            titleEl.querySelector("input").value,
            descrEl.children[1].children[0].value,
            checkboxInput.checked
        )
    })

    const newIssueInput = cloned.querySelector("#mantismigrate-finishup > input");

    cloned.querySelector("#mantismigrate-finishup > button").addEventListener("click", e => {
        e.preventDefault();
        const url = newIssueInput.value;
        if (url === "") {
            alert("please fill in gh issue url");
            return;
        }
        if (!url.startsWith("https://github.com/multitheftauto/mtasa-blue/issues/")) {
            alert("url must start with https://github.com/multitheftauto/mtasa-blue/issues/");
            return;
        }

        box.onFinishIssue(url);
    })

    // Finally append
    notebox.parentElement.appendChild(cloned);

    return box;
}

async function useTemplate(template, label) {
    const url = `https://raw.githubusercontent.com/multitheftauto/mtasa-blue/master/.github/ISSUE_TEMPLATE/${template}`
    
    let resp = await fetch(url);
    
    let templateText = await resp.text();

    // Skip yaml header + two newlines, slice the string
    const headerEnd = templateText.indexOf("---", 3) + 5;
    templateText = templateText.slice(headerEnd);

    // Get bug data
    const bugData = getBugData();

    // Build GitHub box
    const box = buildGitHubBox(bugData, templateText);

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
        url += `body=${encodeURIComponent(body)}&`;
        return url;
    }
    
    // Set box callbacks
    box.onCreateIssue = (title, body, withMilestone) => {
        const url = buildURL(title, body, bugData.assignee, withMilestone);
        window.open(url);
    }

    box.onFinishIssue = async (url) => {
        document.querySelector("#bugnote_text").value = "Moved to " + url;

        // close and suspend
        // const status = 90;
        // const resolution = 80;
        // const bug_id = bugData.id;
        // const last_updated = Date.now();
        // const handler_id = 0;
        // const form = new FormData();
        // form.append('status', 90);
        // form.append('resolution', 80);
        // form.append('bug_id', bugData.id)
        // form.append('last_updated', Date.now()+5000)
        // form.append('handler_id', 0);
        // // https://github.com/multitheftauto/mtasa-blue/issues/530

        // const response = await fetch("https://bugs.mtasa.com/bug_update.php", {
        //     method: "POST",
        //     credentials: "same-origin",
        //     redirect: "follow",
        //     body: form,
        //     // headers: {
        //     //     'Content-Type': 'application/x-www-form-urlencoded;'
        //     // }
        // });
        // console.log(response);

        document.querySelector("#bugnoteadd").submit();
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
    const idStr = getTableField("id");
    let assignee = getTableField("assigned-to");
    if (assignee === "ccw") {
        assignee = "ccw808";
    } else if (assignee === "myonlake") {
        assignee = "patrikjuvonen";
    }

    return {
        status: getTableField("status"),
        title: getTableField("summary").slice(idStr.length+2),
        description: getTableField("description"),
        id: parseInt(idStr),
        assignee: assignee,
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
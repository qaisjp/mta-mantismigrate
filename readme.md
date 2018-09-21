# mantismigrate

## This is a chrome extension
Tested on Scientific Linux.

Built just for bugs.mtasa.com (no other domain, like multitheftauto.com. it might work but it's not supported).

## Installation
- Clone this repository
- Open the Extension Management page by navigating to chrome://extensions.
- Enable Developer Mode by clicking the toggle switch next to Developer mode.
- Click the LOAD UNPACKED button and select the repo directory.

## How to use
Go to any bug page and click one of the blue buttons at the top:

![buttons](/img/1.buttons.png)

This makes this thing appear:

![pane](/img/2.pane.png)

On this page you can:

- Change title
- Change issue body
- Decide whether or not to assign to the backlog milestone (confirmed issues has this box pre-checked)

When you click **Create issue on GitHub** it will pre-fill these details (title, body, milestone, assignee, labels)
and you can preview your issue.

![preview](/img/3.preview.png)

Please make sure markdown looks good.

You can then submit. Copy the github issue URL and go back to the mantis page.

Paste it here and click "finish up":

![finishup](/img/4.finishup.png)

This will do three things:

- update status to closed
- update resolution to suspended
- leave a comment saying "Moved to _githubIssueURL_"

Job done!

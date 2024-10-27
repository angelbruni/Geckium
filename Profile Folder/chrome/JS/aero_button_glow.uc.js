// ==UserScript==
// @name			Aero Button Glow
// @author			Souris
// ==/UserScript==

// https://wiki.mozilla.org/XUL:Panel_Improvements

var mainwindow;
var minButton, maxButton, restoreButton, closeButton;
var minimizeButtonGlow, maximizeButtonGlow, closeButtonGlow;

function createGlow(element_id)
{
    // "level" attribute doesn't seem to do anything
    // if "noautohide" attribute is set, the panel will not open when the firefox window is unfocused

    let elem = document.createXULElement("panel");
    elem.setAttribute("id", element_id);
    elem.setAttribute("role", "group");
    elem.setAttribute("type", "arrow");
    elem.setAttribute("flip", "none");
    elem.setAttribute("animate", "false");
    elem.setAttribute("position", "topright topright");
    elem.setAttribute("noautofocus", "true");
    return elem;
}

function startGlow(elem)
{
    elem.setAttribute("glow", "true");
}

function stopGlow(elem)
{
    elem.setAttribute("glow", "false");
}

function createMinimizeGlow()
{
    minimizeButtonGlow = createGlow("jsMinimizeButtonGlow");
    mainwindow.appendChild(minimizeButtonGlow);
}

function createMaximizeGlow()
{
    maximizeButtonGlow = createGlow("jsMaximizeButtonGlow");
    mainwindow.appendChild(maximizeButtonGlow);
}

function createCloseGlow()
{
    closeButtonGlow = createGlow("jsCloseButtonGlow");
    mainwindow.appendChild(closeButtonGlow);
}

function startGlowMinimize()
{
    startGlow(minimizeButtonGlow);
    minimizeButtonGlow.openPopup(minButton, { triggerEvent: null });
}

function startGlowMaximize()
{
    startGlow(maximizeButtonGlow);
    maximizeButtonGlow.openPopup(maxButton, { triggerEvent: null });
}

function startGlowRestore()
{
    startGlow(maximizeButtonGlow);
    maximizeButtonGlow.openPopup(restoreButton, { triggerEvent: null });
}

function startGlowClose()
{
    startGlow(closeButtonGlow);
    closeButtonGlow.openPopup(closeButton, { triggerEvent: null });
}

function stopGlowMinimize() { stopGlow(minimizeButtonGlow); }
function stopGlowMaximize() { stopGlow(maximizeButtonGlow); }
function stopGlowRestore()  { stopGlow(maximizeButtonGlow); }
function stopGlowClose()    { stopGlow(closeButtonGlow);    }

function deleteMinimizeGlow()
{
    hideMinimizeGlow();
    minimizeButtonGlow.remove();
    minimizeButtonGlow = null;
}

function deleteMaximizeGlow()
{
    hideMaximizeGlow();
    maximizeButtonGlow.remove();
    maximizeButtonGlow = null;
}

function deleteCloseGlow()
{
    hideCloseGlow();
    closeButtonGlow.remove();
    closeButtonGlow = null;
}

function hideMinimizeGlow()
{
    if (minimizeButtonGlow != null)
    {
        stopGlowMinimize();
        minimizeButtonGlow.removeAttribute("panelopen");
        minimizeButtonGlow.setAttribute("hasbeenopened", "false");
        minimizeButtonGlow.hidePopup();
    }
}

function hideMaximizeGlow()
{
    if (maximizeButtonGlow != null)
    {
        stopGlowMaximize();
        maximizeButtonGlow.setAttribute("glow", "false");
        maximizeButtonGlow.removeAttribute("panelopen");
        maximizeButtonGlow.setAttribute("hasbeenopened", "false");
        maximizeButtonGlow.hidePopup();
    }
}

function hideCloseGlow()
{
    if (closeButtonGlow != null)
    {
        stopGlowClose();
        closeButtonGlow.removeAttribute("panelopen");
        closeButtonGlow.setAttribute("hasbeenopened", "false");
        closeButtonGlow.hidePopup();
    }
}

window.addEventListener("load", function()
{
    mainwindow = document.getElementById("main-window");

    createMinimizeGlow();
    createMaximizeGlow();
    createCloseGlow();

    const tabbar = document.getElementById("TabsToolbar");

    minButton     = tabbar.getElementsByClassName("titlebar-min")[0];
    maxButton     = tabbar.getElementsByClassName("titlebar-max")[0];
    restoreButton = tabbar.getElementsByClassName("titlebar-restore")[0];
    closeButton   = tabbar.getElementsByClassName("titlebar-close")[0];

    minButton.addEventListener("mouseenter",     (event) => { startGlowMinimize();  });
    minButton.addEventListener("mouseleave",     (event) => { stopGlowMinimize();   });
    minButton.addEventListener("click",          (event) => { deleteMinimzeGlow();  });

    maxButton.addEventListener("mouseenter",     (event) => { startGlowMaximize();  });
    maxButton.addEventListener("mouseleave",     (event) => { stopGlowMaximize();   });
    maxButton.addEventListener("click",          (event) => { deleteMaximizeGlow(); });

    restoreButton.addEventListener("mouseenter", (event) => { startGlowRestore();   });
    restoreButton.addEventListener("mouseleave", (event) => { stopGlowRestore();    });
    restoreButton.addEventListener("click",      (event) => { deleteMaximizeGlow(); });

    closeButton.addEventListener("mouseenter",   (event) => { startGlowClose();     });
    closeButton.addEventListener("mouseleave",   (event) => { stopGlowClose();      });
    closeButton.addEventListener("click",        (event) => { deleteCloseGlow();    });
});

window.addEventListener("sizemodechange", function()
{
    if (window.windowState != 2)
    {
        if (minimizeButtonGlow == null) createMinimizeGlow();
        if (maximizeButtonGlow == null) createMaximizeGlow();
        if (closeButtonGlow == null)    createCloseGlow();
    }
});

window.addEventListener("resize", function()
{
    hideMinimizeGlow();
    hideMaximizeGlow();
    hideCloseGlow();
});


window.addEventListener("blur", function()
{
    hideMinimizeGlow();
    hideMaximizeGlow();
    hideCloseGlow();
});

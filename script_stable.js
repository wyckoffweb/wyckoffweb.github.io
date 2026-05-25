// IMPORTANT:
// Replace your ENTIRE current script.js with this whole file.
// Do NOT leave any old lines.
// Do NOT include markdown backticks.

const chartGrid = document.getElementById("chartGrid");
const subCategories = document.getElementById("subCategories");
const learnersSection = document.getElementById("learnersSection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const lastUpdated = document.getElementById("lastUpdated");

let scannersData = {};
let currentCategory = "swing";
let currentScanner = null;
let currentImages = [];
let currentImageIndex = 0;

async function loadScanners() {
const response = await fetch("data/scanners.json");
scannersData = await response.json();

 
setupMainTabs();
showCategory("swing");
loadLastUpdated();
 

}

function setupMainTabs() {
const tabs = document.querySelectorAll(".main-tab");

 
tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {

        tabs.forEach(function(t) {
            t.classList.remove("active");
        });

        tab.classList.add("active");

        const category = tab.dataset.category;
        showCategory(category);
    });
});
 

}

function showCategory(category) {

 
currentCategory = category;

chartGrid.innerHTML = "";
subCategories.innerHTML = "";

if (category === "learn") {
    learnersSection.classList.remove("hidden");
    return;
}

learnersSection.classList.add("hidden");

const scanners = scannersData[category];

scanners.forEach(function(scanner) {

    const button = document.createElement("button");

    if (category === "wyckoff") {
        button.className = "sub-tile wyckoff";
    }
    else {
        button.className = "sub-tile";
    }

    button.innerHTML =
        scanner.name +
        " (" +
        scanner.count +
        ")";

    button.addEventListener("click", function() {

        document
            .querySelectorAll(".sub-tile")
            .forEach(function(tile) {
                tile.classList.remove("active");
            });

        button.classList.add("active");

        loadCharts(scanner);
    });

    subCategories.appendChild(button);
});

if (category === "swing") {

    const defaultScanner =
        scanners.find(function(s) {
            return s.id === "confluence";
        }) || scanners[0];

    subCategories
        .children[scanners.indexOf(defaultScanner)]
        .classList.add("active");

    loadCharts(defaultScanner);
}

if (category === "wyckoff") {

    const defaultScanner =
        scanners.find(function(s) {
            return s.id === "ranking";
        }) || scanners[0];

    subCategories
        .children[scanners.indexOf(defaultScanner)]
        .classList.add("active");

    loadCharts(defaultScanner);
}
 

}

async function loadCharts(scanner) {

 
currentScanner = scanner;

chartGrid.innerHTML = "";

try {

    const response = await fetch(
        scanner.path + "/charts.json"
    );

    const pngs = await response.json();

    currentImages = pngs;

    if (!pngs.length) {

        chartGrid.innerHTML =
            '<p class="no-charts">No charts available.</p>';

        return;
    }

    pngs.forEach(function(png, index) {

        const card = document.createElement("div");

        card.className = "chart-card";

        const symbol = png.replace(".png", "");

        const imagePath =
            scanner.path + "/" + png;

        card.innerHTML =
            '<div class="chart-image-wrapper">' +

            '<img ' +
            'src="' + imagePath + '" ' +
            'alt="' + symbol + '" ' +
            'class="chart-image">' +

            '<a ' +
            'href="https://www.tradingview.com/chart/?symbol=NSE:' + symbol + '" ' +
            'target="_blank" ' +
            'class="tv-link">' +

            '<img ' +
            'src="icons/tradingview.png" ' +
            'class="tv-icon">' +

            '</a>' +
            '</div>' +

            '<div class="chart-info">' +
            '<h3>' + symbol + '</h3>' +
            '<p>' + scanner.name + '</p>' +
            '</div>';

        card.addEventListener("click", function(e) {

            if (e.target.closest(".tv-link")) {
                return;
            }

            openModal(index);
        });

        chartGrid.appendChild(card);
    });
}

catch (error) {

    console.error(error);

    chartGrid.innerHTML =
        '<p class="no-charts">Failed to load charts.</p>';
}
 

}

function openModal(index) {

 
currentImageIndex = index;

updateModalImage();

modal.classList.remove("hidden");
 

}

function updateModalImage() {

 
const image = currentImages[currentImageIndex];

modalImage.src =
    currentScanner.path + "/" + image;

renderModalArrows();
 

}

function renderModalArrows() {

 
const oldArrows =
    document.querySelectorAll(".modal-arrow");

oldArrows.forEach(function(a) {
    a.remove();
});

if (currentImageIndex > 0) {

    const leftArrow =
        document.createElement("button");

    leftArrow.className =
        "modal-arrow left-arrow";

    leftArrow.innerHTML = "❮";

    leftArrow.addEventListener("click", function(e) {

        e.stopPropagation();

        currentImageIndex--;

        updateModalImage();
    });

    modal.appendChild(leftArrow);
}

if (currentImageIndex < currentImages.length - 1) {

    const rightArrow =
        document.createElement("button");

    rightArrow.className =
        "modal-arrow right-arrow";

    rightArrow.innerHTML = "❯";

    rightArrow.addEventListener("click", function(e) {

        e.stopPropagation();

        currentImageIndex++;

        updateModalImage();
    });

    modal.appendChild(rightArrow);
}
 

}

closeModal.addEventListener("click", function() {
modal.classList.add("hidden");
});

modal.addEventListener("click", function(e) {

 
if (e.target === modal) {
    modal.classList.add("hidden");
}
 

});

window.addEventListener("keydown", function(e) {

 
if (modal.classList.contains("hidden")) {
    return;
}

if (
    e.key === "ArrowRight" &&
    currentImageIndex < currentImages.length - 1
) {
    currentImageIndex++;
    updateModalImage();
}

if (
    e.key === "ArrowLeft" &&
    currentImageIndex > 0
) {
    currentImageIndex--;
    updateModalImage();
}

if (e.key === "Escape") {
    modal.classList.add("hidden");
}
 

});

let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener("touchstart", function(e) {
touchStartX = e.changedTouches[0].screenX;
});

modal.addEventListener("touchend", function(e) {

 
touchEndX = e.changedTouches[0].screenX;

if (
    touchEndX < touchStartX - 50 &&
    currentImageIndex < currentImages.length - 1
) {
    currentImageIndex++;
    updateModalImage();
}

if (
    touchEndX > touchStartX + 50 &&
    currentImageIndex > 0
) {
    currentImageIndex--;
    updateModalImage();
}
 

});

async function loadLastUpdated() {

 
try {

    const response = await fetch(
        "data/last_updated.json"
    );

    const data = await response.json();

    lastUpdated.innerHTML =
        "Last Updated: " + data.last_updated;
}

catch {

    lastUpdated.innerHTML =
        "Last Updated: Unknown";
}
 

}

loadScanners();

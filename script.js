const chartGrid =
    document.getElementById("chartGrid");

const subCategories =
    document.getElementById("subCategories");

const learnersSection =
    document.getElementById("learnersSection");

const modal =
    document.getElementById("imageModal");

const modalImage =
    document.getElementById("modalImage");

const closeModal =
    document.getElementById("closeModal");

const lastUpdated =
    document.getElementById("lastUpdated");

const searchInput =
    document.getElementById("searchInput");

const loadMoreBtn =
    document.getElementById("loadMoreBtn");

const footerCount =
    document.getElementById("footerCount");

let scannersData = {};

let currentCategory = "swing";

let currentScanner = null;

let currentImages = [];

let filteredImages = [];

let currentImageIndex = 0;

let visibleCount = 20;

const LOAD_STEP = 20;

/* =========================================
   INITIAL LOAD
========================================= */

async function loadScanners() {

    const response =
        await fetch("data/scanners.json");

    scannersData =
        await response.json();

    setupMainTabs();

    showCategory("swing");

    loadLastUpdated();
}

/* =========================================
   MAIN TABS
========================================= */

function setupMainTabs() {

    const tabs =
        document.querySelectorAll(".main-tab");

    tabs.forEach(function(tab) {

        tab.addEventListener(
            "click",
            function() {

                tabs.forEach(function(t) {

                    t.classList.remove("active");
                });

                tab.classList.add("active");

                showCategory(
                    tab.dataset.category
                );
            }
        );
    });
}

/* =========================================
   CATEGORY
========================================= */

function showCategory(category) {

    currentCategory = category;

    chartGrid.innerHTML = "";

    subCategories.innerHTML = "";

    searchInput.value = "";

    if (category === "learn") {

        learnersSection.classList.add("visible");

        chartGrid.classList.add("hidden");

        loadMoreBtn.classList.add("hidden");

        return;
    }

    learnersSection.classList.remove("visible");

    chartGrid.classList.remove("hidden");

    const scanners =
        scannersData[category];

    scanners.forEach(function(scanner) {

        const button =
            document.createElement("button");

        button.className =
            category === "wyckoff"
                ? "sub-tile wyckoff"
                : "sub-tile";

        button.innerHTML =
            scanner.name +
            " (" +
            scanner.count +
            ")";

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".sub-tile")
                    .forEach(function(tile) {

                        tile.classList.remove("active");
                    });

                button.classList.add("active");

                loadCharts(scanner);
            }
        );

        subCategories.appendChild(button);
    });

    let defaultScanner;

    if (category === "swing") {

        defaultScanner =
            scanners.find(
                s => s.id === "confluence"
            ) || scanners[0];
    }
    else {

        defaultScanner =
            scanners.find(
                s => s.id === "ranking"
            ) || scanners[0];
    }

    subCategories
        .children[
            scanners.indexOf(defaultScanner)
        ]
        .classList.add("active");

    loadCharts(defaultScanner);
}

/* =========================================
   LOAD CHARTS
========================================= */

async function loadCharts(scanner) {

    currentScanner = scanner;

    chartGrid.innerHTML = "";

    visibleCount = LOAD_STEP;

    try {

        const response =
            await fetch(
                scanner.path + "/charts.json"
            );

        const pngs =
            await response.json();

        currentImages = pngs;

        filteredImages = [...pngs];

        renderCharts();

    }

    catch (error) {

        console.error(error);

        chartGrid.innerHTML =
            '<p class="no-charts">Failed to load charts.</p>';
    }
}

/* =========================================
   RENDER
========================================= */

function renderCharts() {

    chartGrid.innerHTML = "";

    const visibleCharts =
        filteredImages.slice(
            0,
            visibleCount
        );

    if (!visibleCharts.length) {

        chartGrid.innerHTML =
            '<p class="no-charts">No charts found.</p>';

        loadMoreBtn.classList.add("hidden");

        return;
    }

    visibleCharts.forEach(function(png, index) {

        const symbol =
            png.replace(".png", "");

        const imagePath =
            currentScanner.path +
            "/" +
            png;

        const card =
            document.createElement("div");

        card.className =
            "chart-card";

        card.innerHTML =

            '<div class="chart-image-wrapper">' +

            '<img ' +
            'src="' + imagePath + '" ' +
            'loading="lazy" ' +
            'alt="' + symbol + '" ' +
            'class="chart-image">' +

            '<a ' +
            'href="https://www.tradingview.com/chart/?symbol=NSE:' +
            symbol +
            '" ' +
            'target="_blank" ' +
            'class="tv-link">' +

            '<img ' +
            'src="icons/tradingview.png" ' +
            'class="tv-icon">' +

            '</a>' +

            '</div>' +

            '<div class="chart-info">' +

            '<h3>' +
            symbol +
            '</h3>' +

            '<p>' +
            currentScanner.name +
            '</p>' +

            '</div>';

        card.addEventListener(
            "click",
            function(e) {

                if (
                    e.target.closest(".tv-link")
                ) {
                    return;
                }

                openModal(index);
            }
        );

        chartGrid.appendChild(card);
    });

    updateFooter();

    if (
        visibleCount <
        filteredImages.length
    ) {

        loadMoreBtn.classList.remove(
            "hidden"
        );
    }
    else {

        loadMoreBtn.classList.add(
            "hidden"
        );
    }
}

/* =========================================
   LOAD MORE
========================================= */

loadMoreBtn.addEventListener(
    "click",
    function() {

        visibleCount += LOAD_STEP;

        renderCharts();
    }
);

/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    function(e) {

        const query =
            e.target.value
                .trim()
                .toLowerCase();

        filteredImages =
            currentImages.filter(function(png) {

                return png
                    .toLowerCase()
                    .includes(query);
            });

        visibleCount = LOAD_STEP;

        renderCharts();
    }
);

/* =========================================
   FOOTER
========================================= */

function updateFooter() {

    footerCount.innerHTML =

        "Showing " +

        Math.min(
            visibleCount,
            filteredImages.length
        ) +

        " of " +

        filteredImages.length +

        " charts";
}

/* =========================================
   MODAL
========================================= */

function openModal(index) {

    currentImageIndex = index;

    updateModalImage();

    modal.classList.remove("hidden");
}

function updateModalImage() {

    const image =
        filteredImages[currentImageIndex];

    modalImage.src =
        currentScanner.path +
        "/" +
        image;

    renderModalArrows();
}

function renderModalArrows() {

    document
        .querySelectorAll(".modal-arrow")
        .forEach(a => a.remove());

    if (currentImageIndex > 0) {

        const leftArrow =
            document.createElement("button");

        leftArrow.className =
            "modal-arrow left-arrow";

        leftArrow.innerHTML = "❮";

        leftArrow.addEventListener(
            "click",
            function(e) {

                e.stopPropagation();

                currentImageIndex--;

                updateModalImage();
            }
        );

        modal.appendChild(leftArrow);
    }

    if (
        currentImageIndex <
        filteredImages.length - 1
    ) {

        const rightArrow =
            document.createElement("button");

        rightArrow.className =
            "modal-arrow right-arrow";

        rightArrow.innerHTML = "❯";

        rightArrow.addEventListener(
            "click",
            function(e) {

                e.stopPropagation();

                currentImageIndex++;

                updateModalImage();
            }
        );

        modal.appendChild(rightArrow);
    }
}

/* =========================================
   CLOSE MODAL
========================================= */

closeModal.addEventListener(
    "click",
    function() {

        modal.classList.add("hidden");
    }
);

modal.addEventListener(
    "click",
    function(e) {

        if (e.target === modal) {

            modal.classList.add("hidden");
        }
    }
);

/* =========================================
   KEYBOARD
========================================= */

window.addEventListener(
    "keydown",
    function(e) {

        if (
            modal.classList.contains("hidden")
        ) {
            return;
        }

        if (
            e.key === "ArrowRight" &&
            currentImageIndex <
            filteredImages.length - 1
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
    }
);

/* =========================================
   TOUCH
========================================= */

let touchStartX = 0;

let touchEndX = 0;

modal.addEventListener(
    "touchstart",
    function(e) {

        touchStartX =
            e.changedTouches[0].screenX;
    }
);

modal.addEventListener(
    "touchend",
    function(e) {

        touchEndX =
            e.changedTouches[0].screenX;

        if (
            touchEndX <
            touchStartX - 50 &&
            currentImageIndex <
            filteredImages.length - 1
        ) {

            currentImageIndex++;

            updateModalImage();
        }

        if (
            touchEndX >
            touchStartX + 50 &&
            currentImageIndex > 0
        ) {

            currentImageIndex--;

            updateModalImage();
        }
    }
);

/* =========================================
   LAST UPDATED
========================================= */

async function loadLastUpdated() {

    try {

        const response =
            await fetch(
                "data/last_updated.json"
            );

        const data =
            await response.json();

        lastUpdated.innerHTML =
            data.last_updated;
    }

    catch {

        lastUpdated.innerHTML =
            "Unknown";
    }
}

loadScanners();
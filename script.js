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

const footerCount =
    document.getElementById("footerCount");

const paginationWrapper =
    document.getElementById(
        "paginationWrapper"
    );

let scannersData = {};

let currentCategory = "swing";

let currentScanner = null;

let currentImages = [];

let filteredImages = [];

let currentImageIndex = 0;

let currentPage = 1;

const CHARTS_PER_PAGE = 20;

/* =========================================
   INITIAL LOAD
========================================= */

async function loadScanners() {

    try {

        const response =
            await fetch("data/scanners.json");

        scannersData =
            await response.json();

        setupMainTabs();

        showCategory("swing");

        loadLastUpdated();
    }

    catch (error) {

        console.error(error);
    }
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

    paginationWrapper.innerHTML = "";

    if (category === "learn") {

        learnersSection.classList.add(
            "visible"
        );

        chartGrid.classList.add("hidden");

        paginationWrapper.classList.add(
            "hidden"
        );

        return;
    }

    learnersSection.classList.remove(
        "visible"
    );

    chartGrid.classList.remove("hidden");

    paginationWrapper.classList.remove(
        "hidden"
    );

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

                        tile.classList.remove(
                            "active"
                        );
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

    currentPage = 1;

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

        renderPagination();
    }

    catch (error) {

        console.error(error);

        chartGrid.innerHTML =
            '<p class="no-charts">Failed to load charts.</p>';
    }
}

/* =========================================
   RENDER CHARTS
========================================= */

function renderCharts() {

    chartGrid.innerHTML = "";

    const start =
        (currentPage - 1) *
        CHARTS_PER_PAGE;

    const end =
        start + CHARTS_PER_PAGE;

    const visibleCharts =
        filteredImages.slice(start, end);

    if (!visibleCharts.length) {

        chartGrid.innerHTML =
            '<p class="no-charts">No charts found.</p>';

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

            '</div>';

        card.addEventListener(
            "click",
            function(e) {

                if (
                    e.target.closest(".tv-link")
                ) {
                    return;
                }

                openModal(start + index);
            }
        );

        chartGrid.appendChild(card);
    });

    updateFooter();

    chartGrid.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================================
   PAGINATION
========================================= */

function renderPagination() {

    paginationWrapper.innerHTML = "";

    const totalPages =
        Math.ceil(
            filteredImages.length /
            CHARTS_PER_PAGE
        );

    if (totalPages <= 1) {
        return;
    }

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement("button");

        button.className =
            "page-btn";

        if (i === currentPage) {

            button.classList.add(
                "active"
            );
        }

        button.innerHTML = i;

        button.addEventListener(
            "click",
            function() {

                currentPage = i;

                renderCharts();

                renderPagination();
            }
        );

        paginationWrapper.appendChild(
            button
        );
    }
}

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

        currentPage = 1;

        renderCharts();

        renderPagination();
    }
);

/* =========================================
   FOOTER
========================================= */

function updateFooter() {

    const start =
        (currentPage - 1) *
        CHARTS_PER_PAGE + 1;

    const end =
        Math.min(
            currentPage *
            CHARTS_PER_PAGE,
            filteredImages.length
        );

    footerCount.innerHTML =

        "Showing " +

        start +

        " - " +

        end +

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
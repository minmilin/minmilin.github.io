document.addEventListener("DOMContentLoaded", function () {
    const sideDropdowns =
        document.querySelectorAll(".side-dropdown");

    if (sideDropdowns.length > 0) {
        sideDropdowns.forEach(function (dropdown) {
            const button =
                dropdown.querySelector(":scope > .side-btn");
            if (!button) {
                return;
            }

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                const isOpen =
                    dropdown.classList.contains("open");

                sideDropdowns.forEach(function (otherDropdown) {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove("open");
                    }
                });


                if (isOpen) {
                    dropdown.classList.remove("open");
                } else {
                    dropdown.classList.add("open");
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".side-dropdown")) {
                sideDropdowns.forEach(function (dropdown) {
                    dropdown.classList.remove("open");
                });
            }
        });
    }


    const hotelCards =
        document.querySelectorAll(".hotel-card");

    const starInputs =
        document.querySelectorAll(".star-input");

    const selectedRatingInput =
        document.getElementById("selected-rating");

    const ratingText =
        document.getElementById("rating-text");

    const globalForm =
        document.getElementById("global-review-form");

    const selectHotel =
        document.getElementById("select-hotel");

    const nameInput =
        document.getElementById("global-review-name");

    const messageInput =
        document.getElementById("global-review-message");

    const rankingListContainer =
        document.getElementById("popular-ranking-list");

    if (
        hotelCards.length === 0 ||
        !globalForm ||
        !selectedRatingInput ||
        !ratingText ||
        !selectHotel ||
        !nameInput ||
        !messageInput ||
        !rankingListContainer
    ) {

        return;

    }

    const hotelNames = [

        "Oakwood Hotel & Residence Sriracha",

        "Novotel Marina Sriracha",

        "Kantary Bay Hotel"

    ];

    const initialHotelData = [

        {
            name: hotelNames[0],

            totalScore: 4.8 * 325,

            reviews: 325,

            comments: []
        },

        {
            name: hotelNames[1],

            totalScore: 4.7 * 421,

            reviews: 421,

            comments: []
        },

        {
            name: hotelNames[2],

            totalScore: 4.6 * 386,

            reviews: 386,

            comments: []
        }

    ];

    const STORAGE_KEY =
        "all_hotels_reviews_v2";

    let hotelsData = null;

    try {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            hotelsData =
                JSON.parse(savedData);
        }

    } catch (error) {

        console.warn(
            "ไม่สามารถอ่านข้อมูลรีวิวจาก LocalStorage ได้",
            error
        );

        hotelsData = null;

    }


    if (
        !Array.isArray(hotelsData) ||
        hotelsData.length !== hotelNames.length
    ) {

        hotelsData =
            JSON.parse(
                JSON.stringify(initialHotelData)
            );

        saveAllData();

    }

    hotelsData.forEach(function (hotel, index) {


        if (!hotel.name) {

            hotel.name =
                hotelNames[index];

        }


        if (
            typeof hotel.totalScore !== "number" ||
            !Number.isFinite(hotel.totalScore)
        ) {

            hotel.totalScore =
                initialHotelData[index].totalScore;

        }


        if (
            typeof hotel.reviews !== "number" ||
            !Number.isFinite(hotel.reviews) ||
            hotel.reviews < 0
        ) {

            hotel.reviews =
                initialHotelData[index].reviews;

        }


        if (!Array.isArray(hotel.comments)) {

            hotel.comments = [];

        }

    });

    saveAllData();

    function saveAllData() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(hotelsData)
            );

        } catch (error) {

            console.warn(
                "ไม่สามารถบันทึกข้อมูลรีวิวได้",
                error
            );

        }

    }

    function getAverage(hotel) {

        if (
            !hotel ||
            !Number.isFinite(hotel.reviews) ||
            hotel.reviews <= 0
        ) {

            return 0;

        }


        const average =
            hotel.totalScore /
            hotel.reviews;


        return Math.max(
            0,
            Math.min(5, average)
        );

    }

    function escapeHTML(text) {

        const div =
            document.createElement("div");


        div.textContent =
            String(text ?? "");


        return div.innerHTML;

    }

    function renderApp() {
        renderHotelCards();
        renderRankingList();
    }

    function renderHotelCards() {
        hotelCards.forEach(function (card, index) {
            const data =
                hotelsData[index];

            if (!data) {
                return;
            }

            const scoreElement =
                card.querySelector(".average-score");

            const reviewTotal =
                card.querySelector(".review-total");

            const reviewList =
                card.querySelector(".review-list");

            const average =
                getAverage(data);

            if (scoreElement) {
                scoreElement.textContent =
                    average.toFixed(1);
            }

            if (reviewTotal) {
                reviewTotal.textContent =
                    `จากผู้เข้าพัก ${data.reviews} รีวิว`;

            }

            if (!reviewList) {
                return;
            }

            reviewList.innerHTML = "";

            if (
                !Array.isArray(data.comments) ||
                data.comments.length === 0
            ) {

                reviewList.innerHTML = `
                    <p class="no-review">
                        ยังไม่มีรีวิวใหม่
                        เขียนรีวิวคนแรกได้เลย!
                    </p>
                `;
                return;
            }


            /*
                แสดงรีวิวล่าสุด 3 รายการ
            */

            data.comments
                .slice(-3)
                .reverse()
                .forEach(function (review) {


                    /*
                        ตรวจสอบคะแนน
                    */

                    let rating =
                        Number(review.rating);


                    if (!Number.isFinite(rating)) {

                        rating = 0;

                    }


                    rating =
                        Math.max(
                            0,
                            Math.min(
                                5,
                                Math.round(rating)
                            )
                        );


                    /*
                        สร้างดาว
                    */

                    const starString =
                        "★".repeat(rating) +
                        "☆".repeat(5 - rating);


                    /*
                        สร้าง Review Item
                    */

                    const div =
                        document.createElement("div");


                    div.className =
                        "review-item";


                    div.innerHTML = `

                        <h4>

                            <span>
                                👤
                                ${escapeHTML(review.name)}
                            </span>

                            <span class="review-stars-display">

                                ${starString}

                            </span>

                        </h4>

                        <p>

                            ${escapeHTML(review.message)}

                        </p>

                    `;


                    reviewList.appendChild(div);

                });

        });

    }


    /* ==================================================
       แสดงอันดับโรงแรม
    ================================================== */

    function renderRankingList() {


        rankingListContainer.innerHTML = "";


        /*
            สร้างข้อมูลสำหรับจัดอันดับ
        */

        const rankedHotels =
            hotelsData.map(
                function (hotel, originalIndex) {


                    return {

                        ...hotel,

                        average:
                            getAverage(hotel),

                        index:
                            originalIndex

                    };

                }
            );


        /*
            เรียงคะแนนสูง → ต่ำ
        */

        rankedHotels.sort(
            function (a, b) {

                /*
                    ถ้าคะแนนเท่ากัน
                    ให้โรงแรมที่มีรีวิวมากกว่าอยู่ก่อน
                */

                if (b.average !== a.average) {

                    return b.average - a.average;

                }


                return b.reviews - a.reviews;

            }
        );


        /*
            แสดงอันดับ
        */

        rankedHotels.forEach(
            function (hotel, rankIndex) {


                let badgeClass = "";


                if (rankIndex === 0) {

                    badgeClass = "top-1";

                } else if (rankIndex === 1) {

                    badgeClass = "top-2";

                } else if (rankIndex === 2) {

                    badgeClass = "top-3";

                }


                /*
                    สร้างรายการ
                */

                const item =
                    document.createElement("div");


                item.className =
                    "ranking-item";


                item.innerHTML = `

                    <div class="ranking-left">

                        <div class="rank-badge ${badgeClass}">

                            #${rankIndex + 1}

                        </div>


                        <div class="rank-info">

                            <h4>

                                ${escapeHTML(
                                    hotel.name
                                )}

                            </h4>

                            <p>

                                รีวิวจริงจากผู้เข้าพักสะสม

                            </p>

                        </div>

                    </div>


                    <div class="rank-score-box">

                        <div class="rank-score">

                            ⭐
                            ${hotel.average.toFixed(1)}

                        </div>

                        <div class="rank-reviews">

                            ${hotel.reviews}
                            รีวิว

                        </div>

                    </div>

                `;


                rankingListContainer.appendChild(item);

            }
        );

    }


    /* ==================================================
       ระบบเลือกดาว
    ================================================== */

    starInputs.forEach(
        function (star, index) {


            star.addEventListener(
                "click",
                function () {


                    /*
                        คะแนน 1–5
                    */

                    const ratingValue =
                        index + 1;


                    /*
                        บันทึกค่าคะแนน
                    */

                    selectedRatingInput.value =
                        ratingValue;


                    /*
                        แสดงข้อความ
                    */

                    ratingText.textContent =
                        `คุณให้คะแนน ${ratingValue} ดาว ⭐`;


                    /*
                        เปลี่ยนสถานะดาว
                    */

                    starInputs.forEach(
                        function (currentStar, starIndex) {


                            if (
                                starIndex <
                                ratingValue
                            ) {

                                currentStar.classList.add(
                                    "active"
                                );

                            } else {

                                currentStar.classList.remove(
                                    "active"
                                );

                            }

                        }
                    );

                }
            );

        }
    );


    /* ==================================================
       Hover ดาว
    ================================================== */

    starInputs.forEach(
        function (star, index) {


            star.addEventListener(
                "mouseenter",
                function () {


                    const hoverRating =
                        index + 1;


                    starInputs.forEach(
                        function (
                            currentStar,
                            starIndex
                        ) {


                            if (
                                starIndex <
                                hoverRating
                            ) {

                                currentStar.classList.add(
                                    "hover"
                                );

                            } else {

                                currentStar.classList.remove(
                                    "hover"
                                );

                            }

                        }
                    );

                }
            );


            star.addEventListener(
                "mouseleave",
                function () {


                    starInputs.forEach(
                        function (currentStar) {

                            currentStar.classList.remove(
                                "hover"
                            );

                        }
                    );

                }
            );

        }
    );


    /* ==================================================
       ส่งรีวิว
    ================================================== */

    globalForm.addEventListener(
        "submit",
        function (event) {


            /*
                ป้องกันการ Reload หน้า
            */

            event.preventDefault();


            /*
                ค่าโรงแรม
            */

            const hotelIndex =
                selectHotel.value;


            /*
                คะแนน
            */

            const rating =
                parseInt(
                    selectedRatingInput.value,
                    10
                );


            /*
                ชื่อ
            */

            let name =
                nameInput.value.trim();


            /*
                ข้อความ
            */

            let message =
                messageInput.value.trim();


            /* ==================================================
               ตรวจสอบโรงแรม
            ================================================== */

            if (
                hotelIndex === "" ||
                !hotelsData[hotelIndex]
            ) {

                alert(
                    "กรุณาเลือกโรงแรม"
                );

                return;

            }


            /* ==================================================
               ตรวจสอบคะแนน
            ================================================== */

            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "กรุณาเลือกคะแนนดาว 1–5 ดาว"
                );

                return;

            }


            /* ==================================================
               ตรวจสอบชื่อ
            ================================================== */

            if (name === "") {

                name =
                    "ผู้เข้าพัก";

            }


            /*
                จำกัดความยาวชื่อ
            */

            if (name.length > 80) {

                name =
                    name.substring(0, 80);

            }


            /* ==================================================
               ตรวจสอบข้อความ
            ================================================== */

            if (message === "") {

                message =
                    "ไม่มีข้อความรีวิว";

            }


            /*
                จำกัดความยาวข้อความ
            */

            if (message.length > 500) {

                message =
                    message.substring(0, 500);

            }


            /* ==================================================
               อัปเดตคะแนน
            ================================================== */

            hotelsData[hotelIndex].totalScore +=
                rating;


            hotelsData[hotelIndex].reviews +=
                1;


            /* ==================================================
               ตรวจสอบ comments
            ================================================== */

            if (
                !Array.isArray(
                    hotelsData[hotelIndex].comments
                )
            ) {

                hotelsData[hotelIndex].comments =
                    [];

            }


            /* ==================================================
               เพิ่มรีวิว
            ================================================== */

            hotelsData[hotelIndex].comments.push({

                name:
                    name,

                message:
                    message,

                rating:
                    rating,

                date:
                    new Date().toISOString()

            });


            /* ==================================================
               จำกัดจำนวนรีวิวที่เก็บ
               ป้องกัน LocalStorage ใหญ่เกินไป
            ================================================== */

            if (
                hotelsData[hotelIndex]
                    .comments.length > 100
            ) {

                hotelsData[hotelIndex]
                    .comments =
                    hotelsData[hotelIndex]
                        .comments
                        .slice(-100);

            }


            /* ==================================================
               บันทึกข้อมูล
            ================================================== */

            saveAllData();


            /* ==================================================
               อัปเดตหน้าเว็บ
            ================================================== */

            renderApp();


            /* ==================================================
               รีเซ็ตฟอร์ม
            ================================================== */

            globalForm.reset();


            selectedRatingInput.value =
                "0";


            ratingText.textContent =
                "กรุณากดเลือกดาว";


            starInputs.forEach(
                function (star) {

                    star.classList.remove(
                        "active"
                    );

                    star.classList.remove(
                        "hover"
                    );

                }
            );


            /* ==================================================
               แจ้งผลสำเร็จ
            ================================================== */

            alert(
                "ส่งรีวิวสำเร็จ! " +
                "คะแนนเฉลี่ยและอันดับโรงแรม " +
                "ถูกอัปเดตเรียบร้อยแล้ว"
            );

        }
    );


    /* ==================================================
       โหลดข้อมูลครั้งแรก
    ================================================== */

    renderApp();

});
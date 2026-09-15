const API_URL = "http://127.0.0.1:8000";


// ==================== SIGNUP ====================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("signupName").value;

            const email =
                document.getElementById("signupEmail").value;

            const password =
                document.getElementById("signupPassword").value;

            const signupButton =
                signupForm.querySelector("button");


            try {

                signupButton.disabled = true;
                signupButton.textContent =
                    "Creating Account...";


                const response =
                    await fetch(
                        `${API_URL}/signup`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    data.message &&
                    data.message
                        .toLowerCase()
                        .includes("already")
                ) {

                    showNotification(
                        "Account Already Exists",
                        "This email is already registered. Please login.",
                        "error"
                    );

                    return;
                }


                if (
                    response.ok &&
                    data.user_id
                ) {

                    showNotification(
                        "Account Created",
                        "Your account was created successfully.",
                        "success"
                    );


                    setTimeout(function () {

                        window.location.href =
                            "login.html";

                    }, 1200);


                    return;
                }


                showNotification(
                    "Signup Failed",
                    data.message ||
                    "Something went wrong.",
                    "error"
                );


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                showNotification(
                    "Signup Failed",
                    error.message ||
                    "Unable to create account.",
                    "error"
                );


            } finally {

                signupButton.disabled =
                    false;

                signupButton.textContent =
                    "Create Account";

            }

        }
    );

}



// ==================== LOGIN ====================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("loginEmail").value;

            const password =
                document.getElementById("loginPassword").value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.access_token
                ) {

                    localStorage.setItem(
                        "access_token",
                        data.access_token
                    );


                    window.location.href =
                        "dashboard.html";


                } else {

                    showNotification(
                        "Login Failed",
                        data.message ||
                        "Invalid email or password.",
                        "error"
                    );

                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showNotification(
                    "Login Failed",
                    "Unable to connect to the server.",
                    "error"
                );

            }

        }
    );

}



// ==================== DASHBOARD PROTECTION ====================

const isDashboard =
    window.location.pathname
        .endsWith("dashboard.html");


if (isDashboard) {

    const token =
        localStorage.getItem("access_token");


    if (!token) {

        window.location.href =
            "login.html";

    }

}



// ==================== USER PROFILE ====================

const dashboardUserName =
    document.getElementById("userName");


if (dashboardUserName) {

    const token =
        localStorage.getItem("access_token");


    if (token) {

        fetch(
            `${API_URL}/profile`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )
        .then(
            response =>
                response.json()
        )
        .then(
            data => {

                if (data.name) {

                    dashboardUserName.textContent =
                        data.name;

                }

            }
        )
        .catch(
            error => {

                console.error(
                    "Profile error:",
                    error
                );

            }
        );

    }

}



// ==================== LOGOUT ====================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "access_token"
            );


            window.location.href =
                "login.html";

        }
    );

}



// ==================== ANALYZE RESUMES ====================

const analyzeBtn =
    document.getElementById("analyzeBtn");


if (analyzeBtn) {

    const loadingOverlay =
        document.getElementById(
            "loadingOverlay"
        );


    analyzeBtn.addEventListener(
        "click",
        async function () {

            const jobDescription =
                document
                    .getElementById(
                        "jobDescription"
                    )
                    .value;


            const resumeFiles =
                document
                    .getElementById(
                        "resumeFiles"
                    )
                    .files;



            // Job description validation

            if (!jobDescription.trim()) {

                showNotification(
                    "Job Description Required",
                    "Please enter a job description.",
                    "error"
                );

                return;
            }



            // Resume validation

            if (
                resumeFiles.length === 0
            ) {

                showNotification(
                    "Resume Required",
                    "Please upload at least one resume.",
                    "error"
                );

                return;
            }



            // Authentication

            const token =
                localStorage.getItem(
                    "access_token"
                );


            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }



            // FormData

            const formData =
                new FormData();


            formData.append(
                "job_description",
                jobDescription
            );


            for (
                const file of resumeFiles
            ) {

                formData.append(
                    "files",
                    file
                );

            }



            try {

                analyzeBtn.textContent =
                    "Analyzing Candidates...";


                analyzeBtn.disabled =
                    true;


                loadingOverlay.style.display =
                    "flex";



                const response =
                    await fetch(
                        `${API_URL}/analyze-resume`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();



                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Analysis failed."
                    );

                }



                // Save results

                sessionStorage.setItem(
                    "analysis_results",
                    JSON.stringify(data)
                );



                // Open results

                window.location.href =
                    "results.html";


            } catch (error) {

                loadingOverlay.style.display =
                    "none";


                console.error(
                    "Analysis error:",
                    error
                );


                showNotification(
                    "Analysis Failed",
                    error.message ||
                    "Something went wrong while analyzing the resumes.",
                    "error"
                );


            } finally {

                loadingOverlay.style.display =
                    "none";


                analyzeBtn.textContent =
                    "Analyze Candidates →";


                analyzeBtn.disabled =
                    false;

            }

        }
    );

}



// ==================== RESULTS PAGE ====================

const candidateList =
    document.getElementById(
        "candidateList"
    );


if (candidateList) {

    const storedResults =
        sessionStorage.getItem(
            "analysis_results"
        );


    if (!storedResults) {

        candidateList.innerHTML = `
            <div class="analysis-placeholder">
                <h3>No analysis found</h3>
                <p>Please start a new screening.</p>
            </div>
        `;


    } else {

        const data =
            JSON.parse(storedResults);


        const results =
            data.results;


        results.forEach(
            function (candidate) {

                const candidateCard =
                    document.createElement(
                        "div"
                    );


                candidateCard.className =
                    "candidate-result";


                candidateCard.style.cursor =
                    "pointer";


                candidateCard.innerHTML = `
                    <div class="rank">
                        #${candidate.rank}
                    </div>

                    <div class="candidate-info">

                        <h3>
                            ${candidate.filename}
                        </h3>

                        <p>
                            Candidate Resume
                        </p>

                        <div class="result-skills">
                            ${candidate.analysis.matched_skills
                                .map(
                                    skill =>
                                        `<span>${skill}</span>`
                                )
                                .join("")}
                        </div>

                    </div>

                    <div class="result-score">
                        ${candidate.overall_score}%
                        <small>Match</small>
                    </div>
                `;


                candidateCard.addEventListener(
                    "click",
                    function () {

                        showCandidateAnalysis(
                            candidate
                        );


                        document
                            .getElementById(
                                "candidateAnalysis"
                            )
                            .scrollIntoView({
                                behavior: "smooth"
                            });

                    }
                );


                candidateList.appendChild(
                    candidateCard
                );

            }
        );

    }

}



// ==================== INITIAL SELECTED CANDIDATE ====================

const candidateAnalysis =
    document.getElementById(
        "candidateAnalysis"
    );


if (candidateAnalysis) {

    const storedResults =
        sessionStorage.getItem(
            "analysis_results"
        );


    if (storedResults) {

        const data =
            JSON.parse(storedResults);


        const results =
            data.results;


        if (results.length > 0) {

            showCandidateAnalysis(
                results[0]
            );

        }

    }

}



// ==================== SHOW CANDIDATE ANALYSIS ====================

function showCandidateAnalysis(
    candidate
) {

    document
        .getElementById(
            "selectedCandidate"
        )
        .textContent =
            candidate.filename;


    document
        .getElementById(
            "overallScore"
        )
        .textContent =
            `${candidate.overall_score}%`;



    const matchedSkills =
        document.getElementById(
            "matchedSkills"
        );


    matchedSkills.innerHTML = "";


    candidate.analysis
        .matched_skills
        .forEach(
            function (skill) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    skill;


                matchedSkills.appendChild(
                    li
                );

            }
        );



    const missingSkills =
        document.getElementById(
            "missingSkills"
        );


    missingSkills.innerHTML = "";


    candidate.analysis
        .missing_skills
        .forEach(
            function (skill) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    skill;


                missingSkills.appendChild(
                    li
                );

            }
        );



    const strengths =
        document.getElementById(
            "strengths"
        );


    strengths.innerHTML = "";


    candidate.analysis
        .strengths
        .forEach(
            function (strength) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    strength;


                strengths.appendChild(
                    li
                );

            }
        );



    const weaknesses =
        document.getElementById(
            "weaknesses"
        );


    weaknesses.innerHTML = "";


    candidate.analysis
        .weaknesses
        .forEach(
            function (weakness) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    weakness;


                weaknesses.appendChild(
                    li
                );

            }
        );



    const suggestions =
        document.getElementById(
            "suggestions"
        );


    suggestions.innerHTML = "";


    candidate.analysis
        .suggestions
        .forEach(
            function (suggestion) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    suggestion;


                suggestions.appendChild(
                    li
                );

            }
        );

}



// ==================== RECENT ANALYSES ====================

const analysisList =
    document.getElementById(
        "analysisList"
    );


if (analysisList) {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (token) {

        fetch(
            `${API_URL}/analyses`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        )
        .then(
            response =>
                response.json()
        )
        .then(
            data => {

                const analyses =
                    data.analyses || [];


                if (
                    analyses.length === 0
                ) {

                    return;

                }


                analyses.sort(
                    function (a, b) {

                        return b._id
                            .localeCompare(
                                a._id
                            );

                    }
                );


                const latestAnalyses =
                    analyses.slice(
                        0,
                        5
                    );


                analysisList.innerHTML =
                    "";


                latestAnalyses.forEach(
                    function (analysis) {

                        const card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "recent-analysis-card";


                        card.style.cursor =
                            "pointer";


                        card.innerHTML = `
                            <div class="recent-analysis-info">

                                <h3>
                                    ${analysis.resume_filename}
                                </h3>

                                <p>
                                    Resume Analysis
                                </p>

                            </div>

                            <div class="recent-score">
                                ${analysis.overall_score}%
                                <small>Match</small>
                            </div>
                        `;


                        card.addEventListener(
                            "click",
                            function () {

                                sessionStorage.setItem(
                                    "selected_analysis_id",
                                    analysis._id
                                );


                                window.location.href =
                                    "results.html";

                            }
                        );


                        analysisList.appendChild(
                            card
                        );

                    }
                );

            }
        )
        .catch(
            error => {

                console.error(
                    "Analyses error:",
                    error
                );

            }
        );

    }

}



// ==================== SELECTED RESUME FILES ====================

const resumeFilesInput =
    document.getElementById(
        "resumeFiles"
    );


const selectedFilesContainer =
    document.getElementById(
        "selectedFiles"
    );


if (
    resumeFilesInput &&
    selectedFilesContainer
) {

    resumeFilesInput.addEventListener(
        "change",
        function () {

            selectedFilesContainer.innerHTML =
                "";


            const files =
                resumeFilesInput.files;


            for (
                const file of files
            ) {

                const fileItem =
                    document.createElement(
                        "div"
                    );


                fileItem.className =
                    "selected-file";


                fileItem.innerHTML = `
                    <span>📄</span>
                    <span>${file.name}</span>
                `;


                selectedFilesContainer.appendChild(
                    fileItem
                );

            }

        }
    );

}



// ==================== NAVBAR SCROLL EFFECT ====================

const navbar =
    document.querySelector(
        ".navbar"
    );


if (navbar) {

    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY > 20
            ) {

                navbar.classList.add(
                    "scrolled"
                );

            } else {

                navbar.classList.remove(
                    "scrolled"
                );

            }

        }
    );

}



// ==================== NOTIFICATION ====================

function showNotification(
    title,
    message,
    type = "success"
) {

    const notification =
        document.getElementById(
            "notification"
        );


    const notificationIcon =
        document.getElementById(
            "notificationIcon"
        );


    const notificationTitle =
        document.getElementById(
            "notificationTitle"
        );


    const notificationMessage =
        document.getElementById(
            "notificationMessage"
        );


    if (!notification) {

        return;

    }


    notificationTitle.textContent =
        title;


    notificationMessage.textContent =
        message;


    notification.classList.remove(
        "error"
    );


    if (type === "error") {

        notification.classList.add(
            "error"
        );


        notificationIcon.textContent =
            "×";

    } else {

        notificationIcon.textContent =
            "✓";

    }


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        3500
    );

}
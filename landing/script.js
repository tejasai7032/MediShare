document.addEventListener(
    "DOMContentLoaded",
    () => {

        const yearElement =
            document.getElementById("year");

        if (yearElement) {
            yearElement.textContent =
                new Date().getFullYear();
        }


        /*
         * Replace these two URLs after
         * MediShare deployment.
         */

        const LIVE_DEMO_URL =
            "#";

        const GITHUB_URL =
    "https://github.com/tejasai7032/MediShare";


        const liveDemoButton =
            document.getElementById(
                "liveDemoButton"
            );

        const githubButton =
            document.getElementById(
                "githubButton"
            );


        if (liveDemoButton) {

            liveDemoButton.href =
                LIVE_DEMO_URL;

        }


        if (githubButton) {

            githubButton.href =
                GITHUB_URL;

        }


        /*
         * Smooth navigation for internal links.
         */

        const internalLinks =
            document.querySelectorAll(
                'a[href^="#"]'
            );


        internalLinks.forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    (event) => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            !targetId ||
                            targetId === "#"
                        ) {
                            return;
                        }


                        const target =
                            document.querySelector(
                                targetId
                            );


                        if (target) {

                            event.preventDefault();

                            target.scrollIntoView({
                                behavior:
                                    "smooth",
                                block:
                                    "start"
                            });

                        }

                    }
                );

            }
        );

    }
);
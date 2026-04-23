pipeline {
    agent any

    environment {
        IMAGE_FLASK = "neuralguard-flask"
        IMAGE_NODE  = "neuralguard-node"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Docker Compose Build & Up') {
            steps {
                bat 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            emailext(
                subject: "NeuralGuard CI/CD: SUCCESS ✅",
                body: """
                    <h2>Build Successful</h2>
                    <b>Build Number:</b> ${env.BUILD_NUMBER}<br>
                    <b>Build URL:</b> ${env.BUILD_URL}
                """,
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in"
            )
        }

        failure {
            emailext(
                subject: "NeuralGuard CI/CD: FAILURE ❌",
                body: "Build failed. Check Jenkins logs: ${env.BUILD_URL}",
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in"
            )
        }
    }
}
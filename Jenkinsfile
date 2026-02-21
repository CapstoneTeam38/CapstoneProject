// Jenkins Pipeline for NeuralGuard1

pipeline {
    agent any

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker container for NeuralGuard...'
                bat 'docker --version'
            }
        }
    }

    post {
        success {
            emailext(
                subject: "NeuralGuard CI/CD: SUCCESS",
                body: """
                    <h2 style="color:green;">Build Successful ✅</h2>
                    <b>Project:</b> NeuralGuard<br>
                    <b>Build Number:</b> ${env.BUILD_NUMBER}<br>
                    <b>Status:</b> ${currentBuild.currentResult}<br>
                    <b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in",
                recipientProviders: []
            )
        }

        failure {
            emailext(
                subject: "NeuralGuard CI/CD: FAILURE ❌",
                body: """
                    <h2 style="color:red;">Build Failed 🚨</h2>
                    <b>Project:</b> NeuralGuard<br>
                    <b>Build Number:</b> ${env.BUILD_NUMBER}<br>
                    <b>Status:</b> ${currentBuild.currentResult}<br>
                    <b>Check Logs:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in",
                recipientProviders: []
            )
        }
    }
}
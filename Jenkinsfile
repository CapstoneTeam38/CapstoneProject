pipeline {
    agent any

    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
                echo 'Code successfully pulled from GitHub!'
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
            body: "Build URL: ${env.BUILD_URL}",
            to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in",
            recipientProviders: []
        )
    }

    failure {
        emailext(
            subject: "NeuralGuard CI/CD: FAILURE",
            body: "Build URL: ${env.BUILD_URL}",
            to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in",
            recipientProviders: []
        )
    }
}

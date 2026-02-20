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
                to: "disha.sharma2607@gmail.com",
                recipientProviders: []
            )
        }
    }
}

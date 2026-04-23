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

        // ✅ ADD THIS (VERY IMPORTANT)
        stage('Setup Env') {
            steps {
                dir('backend') {
                    writeFile file: '.env', text: 'MONGO_URI=mongodb+srv://akanksha:Capstone@cluster0.ww1daav.mongodb.net/fraud_platform?retryWrites=true&w=majority'
                }
            }
        }

        // ✅ Node dependencies (INSIDE client folder)
        stage('Install Node Dependencies') {
            steps {
                dir('client') {
                    bat 'npm install'
                }
            }
        }

        // ✅ Python dependencies (INSIDE backend)
        stage('Install Python Dependencies') {
            steps {
                dir('backend') {
                    bat 'pip install -r requirements.txt'
                }
            }
        }

        // ✅ Run Python test
        stage('Run Python Tests') {
            steps {
                dir('backend') {
                    bat 'python app.py'
                }
            }
        }

        // ✅ Docker build Flask (backend)
        stage('Docker Build - Flask') {
            steps {
                echo 'Building Flask Docker Image...'
                bat "docker build -t %IMAGE_FLASK% ./backend"
            }
        }

        // ✅ Docker build Node (client)
        stage('Docker Build - Node') {
            steps {
                echo 'Building Node Docker Image...'
                bat "docker build -t %IMAGE_NODE% ./client"
            }
        }

        // ✅ Docker Compose (root)
        stage('Docker Compose Up') {
            steps {
                echo 'Starting all services...'
                bat 'docker-compose up -d'
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
                    <b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in"
            )
        }

        failure {
            emailext(
                subject: "NeuralGuard CI/CD: FAILURE ❌",
                body: """
                    <h2>Build Failed</h2>
                    <b>Check Logs:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a>
                """,
                mimeType: 'text/html',
                to: "adwitiya.sinha23@st.niituniversity.in, akanksha.joshi23@st.niituniversity.in, disha.sharma23@st.niituniversity.in, dhyey.pujara23@st.niituniversity.in"
            )
        }
    }
}
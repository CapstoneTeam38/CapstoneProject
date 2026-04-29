# NeuralGuard – AI-Powered Fraud Detection System

## Overview

Financial fraud results in significant global losses each year, making accurate and scalable detection systems critical. NeuralGuard is an end-to-end fraud detection platform that combines machine learning and anomaly detection techniques to identify suspicious transactions in real time.

The system is designed to handle highly imbalanced datasets and large transaction volumes while providing interpretable results through explainability techniques.

---

## Key Features

- Real-time fraud detection and monitoring  
- Interactive analytics dashboard for transaction insights  
- Risk score visualization for decision support  
- Multi-model pipeline for improved accuracy and robustness  
- Explainable predictions using SHAP  
- Case review system for analyzing flagged transactions  

---

## Machine Learning Approach

The system uses a hybrid modeling strategy based on dataset size and characteristics:

- Random Forest + Isolation Forest for smaller datasets  
- XGBoost + One-Class SVM for larger datasets  

This approach combines supervised learning with anomaly detection to improve fraud identification in imbalanced data scenarios.

---

## Tech Stack

### Backend
- Node.js (Express)  
- Python (Flask for ML model integration)  

### Frontend
- React  
- Chart.js  

### Database
- MongoDB Atlas  

---

## Datasets Used

- IEEE Fraud Detection Dataset  
- Credit Card Fraud Detection Dataset  
- PaySim Dataset  

---

## System Workflow

1. Transaction data is ingested into the system  
2. Data is processed and passed through the appropriate ML pipeline  
3. The model assigns a fraud probability or anomaly score  
4. Results are displayed on the dashboard with visual insights  
5. Suspicious transactions are flagged for further review  

---

## Deployment and Performance

- Designed to process tens of thousands of transactions efficiently  
- Supports near real-time predictions  
- Backend APIs integrated with machine learning models for seamless inference  

---

## Contributions

This project was developed as part of a team effort.  
Primary contributions include system design, machine learning pipeline development, backend integration, and dashboard functionality.

---

## Future Improvements

- Integration of advanced deep learning models  
- Improved real-time streaming capabilities  
- Enhanced explainability and visualization features  
- Scalable deployment using cloud infrastructure  

---


# Deploy to Google Cloud Run

This guide explains how to deploy the **Postcards to Mars** application to Google Cloud Run using the command line.

## Prerequisites

1.  **Google Cloud CLI (`gcloud`)**: Ensure you have the Google Cloud CLI installed and authenticated.
    - [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install)
    - Run `gcloud auth login` to authenticate.
2.  **Google Cloud Project**: You need an active Google Cloud project with billing enabled.

## Configuration

The application uses standard Cloud Run environment variables. The `Dockerfile` is configured to listen on port 8080.

## Deployment Steps

1.  **Set your project ID** (replace `YOUR_PROJECT_ID` with your actual project ID):
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

2.  **Deploy from source**:
    Run the following command in the root of the project. This command will build the container using Cloud Build and deploy it to Cloud Run.

    ```bash
    gcloud run deploy postcards-to-mars \
      --source . \
      --platform managed \
      --region europe-west2 \
      --allow-unauthenticated \
      --build-service-account projects/gen-lang-client-0453745132/serviceAccounts/309747105296-compute@developer.gserviceaccount.com
    ```

    *Note: Replace `us-central1` with your preferred region.*

3.  **Follow the prompts**:
    - If prompted to enable APIs (like Cloud Build API, Artifact Registry API, Cloud Run Admin API), answer `y` (yes).
    - The deployment may take a few minutes.

4.  **Access the App**:
    - Once deployment is complete, the CLI will output a Service URL (e.g., `https://postcards-to-mars-xyz123.a.run.app`).
    - Open this URL in your browser to verify the deployment.

## Environment Variables

If your application requires environment variables (e.g., `GEMINI_API_KEY`), you can set them during deployment:

```bash
gcloud run deploy postcards-to-mars \
  --source . \
  --set-env-vars GEMINI_API_KEY=your_api_key_here \
  --region us-central1
```

## Service URL and Stability

Cloud Run provides a **stable, deterministic URL** for your service. The URL is generated in the format:
`https://[SERVICE_NAME]-[HASH]-[REGION].a.run.app`

As long as you deploy to the same **Service Name** (`postcards-to-mars`) and **Region** (e.g., `us-central1`), the URL will **remain the same** across all future deployments. You can safely bookmark or share this URL.

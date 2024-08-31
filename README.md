# Workflow Scheduler

## Overview

This project implements a workflow scheduler using a queue system with support for multiple queue backends (RabbitMQ and Bull). The scheduler can execute various actions in a predefined sequence, such as sending emails and waiting for a specified duration. It is designed to be extensible and easy to configure.

## Features

- **Extensible Workflow**: Easily define workflows by chaining actions like email sending and timers.
- **Queue Management**: Supports RabbitMQ and Bull for handling message queues.
- **Retry Mechanism**: Automatically retries failed actions based on configurable parameters.

## Architecture

The core components of the architecture include:

- **Actions**: Actions represent individual tasks within a workflow, such as sending an email (`EmailAction`) or waiting for a specified duration (`TimerAction`).
- **Workflows**: A `Workflow` consists of a sequence of actions to be executed in order.
- **Queues**: `RabbitMQQueue` and `BullQueue` are implemented to manage message processing and retry logic.
- **Event Handling**: The `EventHandler` service listens for incoming events, triggers the corresponding workflow, and enqueues the workflow for processing.

## Project Structure

- `src/actions`: Contains action classes like `EmailAction` and `TimerAction`.
- `src/models`: Contains the `Workflow` model which manages the execution of actions.
- `src/queues`: Contains queue implementations like `RabbitMQQueue` and `BullQueue`.
- `src/services`: Contains services like `EventHandler` that manage event processing.
- `src/utils`: Utility functions like `Logger` for logging.
- `tests/unit-tests`: Unit tests for the project, organized by feature.

## Getting Started
### Prerequisites
-  **Node.js**: Ensure that you have Node.js installed on your machine.
- **pnpm**: This project uses `pnpm` for package management. You can install it globally using:

```bash
npm install -g pnpm
```

#### Docker: Ensure Docker and Docker Compose are installed if you plan to run the application using Docker.
### Installation


```bash
git clone https://github.com/yourusername/workflow-scheduler.git
cd workflow-scheduler
pnpm install
```

### Running the Application
```bash
docker-compose up --build
```

## Manual HTTP Testing

You can manually test the event handling by sending an HTTP POST request to the application’s event endpoint.

### Example 1: Testing "socksPurchased" Event

```bash
curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{ "eventName": "socksPurchased", "userEmail": "pete@healthtech1.uk" }'
```

### Example 2: Testing "websiteSignup" Event

```bash
curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{ "eventName": "websiteSignup", "userEmail": "pete@healthtech1.uk" }'
```


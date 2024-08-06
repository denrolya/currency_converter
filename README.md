
# Currency Converter Application


***Writing documentation is as important as writing code, so I spent ~15% of my time writing this documentation.***

This project showcases currency converter API using **NestJS**, with a focus on clean and scalable architecture, efficient caching with minimal overhead and high reliability.

## 1. Features

- 💱 Fetches current exchange rates from the Monobank API.
- 🗄️ Caches exchange rates in Redis to optimize performance.
- 🔄 Converts currency amounts based on the fetched exchange rates.
- 📬 Single POST endpoint to handle currency conversion.
- 📄 Swagger documentation available at `api/docs`.
- ⚙️ Configurable environment variables for easy setup.

## 2. System Requirements

1. **Node.js** v18 + **npm** v10
2. **Redis** v7.2

## 3. Installation

1. **Ensure all system requirements are met:**
    - Install **Node.js** v18 from [Node.js official website](https://nodejs.org/)
    - Install **Redis** v7.2 from [Redis official website](https://redis.io/)

2. **Install project dependencies:**
   ```sh
   npm i
   ```

3. **Set up environment variables:**
    - Create a copy of the example environment file:
      ```sh
      cp .env.dist .env
      ```
    - Update the newly created `.env` file with your configuration details

4. **Run the development server:**
   ```sh
   npm run start:dev
   ```
    - **OR** build and run the production version:
   ```sh
   npm run build && npm run start:prod
   ```
## 4. Usage
You can either use the Swagger documentation at `api/docs` to test the API or send a POST request to the `/api/currency/convert` endpoint with the following payload:
```json
{
    "source": "USD",
    "target": "EUR",
    "amount": 100
}
```
Replace the currency codes and amount with your desired values. The API will return the converted amount based on the current exchange rates.
Or you can use the following **curl** command(adjust port settings in the command if necessary):
```sh
curl -X POST "http://localhost:3000/api/currency/convert" -H "Content-Type: application/json" -d "{\"source\":\"USD\",\"target\":\"EUR\",\"amount\":100}"
```
Alternatively you can use **Postman** or **Insomnia** or any other API testing tool to test the API.

## 5. Implementation Details

This application leverages **NestJS** to provide a robust and scalable currency converter API. It interacts with the *Monobank* API to fetch exchange rates, caching them in **Redis** for efficiency.

### 5.1 How It Works

1. **POST Endpoint**:
    - Accepts a JSON payload with `source` and `target` currency codes and an `amount`.
    - Ensures currency codes are valid.
    - Example payload:
    ```json
    {
        "source": "USD",
        "target": "EUR",
        "amount": 100
    }
    ```

2. **CurrencyTransformer**:
    - Ensures given currency codes are enabled in the app.
    - Converts `source` and `target` parameters(with possibility to use other names) into a currency object.
    - Returns an object containing necessary ISO 4217 codes.

3. **CurrencyService**:
    - Injected into the controller using DI to handle main conversion logic
    - Uses `ExchangeService` abstraction for fetching exchange rates.

4. **ExchangeService and MonobankService**:
    - `ExchangeService` is an interface for fetching exchange rates.
    - Configured in the currency module, `MonobankService` implements `ExchangeService` to interact with the Monobank API.

5. **Conversion Logic**:
    - `CurrencyService.convert` method uses `ExchangeService.findPair` to get exchange rates.
    - `ExchangeService.findPair` fetches exchange rates via `ExchangeService.fetchRates`.
    - Checks cache first; if not found, fetches from Monobank API.
    - Caches the fetched rates.
    - Converts the amount based on the exchange rates.

6. **Cache Management**:
    - Uses **Redis** for caching exchange rates.
    - Checks cache before making API calls.
    - Handles exceptions properly.

### 5.2 Highlights

- 🚀 **Scalability & Reusability**: Implements design patterns for easy scalability and reusability.
- ⚠️ **Exception Handling**: Comprehensive handling of exceptions.
- 📚 **Documentation**: Fully documented using `@nestjs/swagger`.
- 🏗️ **Modular Architecture**: Clear separation of concerns with well-structured modules.
- ⚙️ **Configuration Management**: Uses a config module for managing environment variables (Redis parameters, app port, Monobank API URL).
- ✨ **Efficiency & Clean Code**: Follows DRY and KISS principles.
- 🔑 **Constants for Cache Keys**: Improves maintainability.

### 5.3 Additional Notes

- ✅ **Testing**: Code is 100% covered with unit tests and e2e tests.
- 📘 **TypeScript**: Utilizes **TypeScript** best practices.
- 📦 **Basic Packages**: Uses essential packages for **NestJS**.
- 📝 **TODOs**: Identifies areas for future improvement.

## 6. Testing
Project includes both unit and end-to-end (e2e) tests to ensure the reliability and correctness of the application. 

### 6.1 Unit Tests
I've implemented unit tests for services, controller and transformer. They are located next to the files they are testing in the same directory.

To run the unit tests, use the following command:
```sh
npm run test
```

or if you want to check coverage, run tests using:
```sh
npm run test:cov
```
and after the execution open `coverage/lcov-report/index.html` in your browser.

### 6.2 End-to-End (e2e) Tests
Implemented e2e tests for the currency module, more specifically the currency controller. Test is located in `test` directory. 

To run the e2e tests, use the following command
```sh
npm run test:e2e
```

# ANCHOR_INTEGRATION.md

## Overview

This document explains the KYC, Wallets, and Pockets features integrated with Anchor's financial infrastructure in the Odyss trip planning backend.

## What is Anchor?

[Anchor](https://getanchor.co/) is a financial infrastructure platform that provides:
- **KYC (Know Your Customer)** verification
- **Wallet management** with virtual accounts
- **Pocket/sub-account** creation and management
- **Fund transfers** between accounts
- **Compliance** and fraud detection

## Architecture

```
Client Request → Controller → Service → AnchorService → Anchor API
     ↓              ↓         ↓           ↓            ↓
   POST /kyc    KYCController  KycService  AnchorService  Anchor API
```

## KYC (Know Your Customer)

### Purpose
KYC verification is required for financial services to identify and verify customers, ensuring compliance with regulations.

### Endpoints

#### Create Customer
```http
POST /api/kyc/customers
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "07061234507",
  "address_line_1": "1, Ikeja Village Street",
  "city": "Ikeja",
  "state": "Lagos",
  "postal_code": "123456",
  "country": "NG",
  "bvn": "22222324206",
  "date_of_birth": "1994-06-25",
  "gender": "Male",
  "metadata": {
    "trip_destination": "Paris",
    "travel_dates": "2024-06-01 to 2024-06-15"
  }
}
```

**Required Fields**: `first_name`, `last_name`, `email`, `phone`, `address_line_1`, `city`, `state`, `postal_code`
**Optional Fields**: `address_line_2`, `bvn`, `date_of_birth`, `gender`, `metadata`
**Phone Format**: Nigerian format (e.g., "07061234507")
**Country**: Defaults to "NG" (Nigeria)

**Response**: Customer data with unique ID from Anchor

#### Get Customer
```http
GET /api/kyc/customers/{customer_id}
```

**Response**: Customer verification status and details

#### Verify Customer (Upgrade KYC Tier)
```http
POST /api/kyc/customers/{customer_id}/verify
Content-Type: application/json

{
  "level": "TIER_1",
  "bvn": "22222222200",
  "date_of_birth": "1996-03-20",
  "gender": "Female"
}
```

**Response**: Verification status (automatic for Tier 1, manual review for Tier 2)

#### Update Customer
```http
PUT /api/kyc/customers/{customer_id}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com"
}
```

**Response**: Updated customer data

#### Delete Customer
```http
DELETE /api/kyc/customers/{customer_id}
```

**Response**: Deletion confirmation

### KYC Tiers & Funding Limits

According to [Anchor's KYC documentation](https://docs.getanchor.co/docs/individual-customer-kyc), customers progress through verification tiers:

#### **Tier 0 (Default)**
- **Requirements**: Full name, address, email, phone number
- **Status**: Basic verification, limited funding capabilities
- **Use Case**: Initial trip registration, basic account access

#### **Tier 1 (Recommended)**
- **Requirements**: BVN + date of birth + gender
- **Status**: Automatic validation (immediate)
- **Benefits**: Higher funding limits, full financial services
- **Note**: BVN name/phone must match registration details

#### **Tier 2 (Advanced)**
- **Requirements**: Document upload (Driver's License, Voter's Card, Passport, NIN, National ID)
- **Status**: Manual review (24-48 hours)
- **Benefits**: Maximum funding limits, all financial services

### Use Cases
- **Trip Registration**: Verify traveler identity before creating financial accounts
- **Compliance**: Meet regulatory requirements for financial services
- **Fraud Prevention**: Ensure legitimate users access financial features
- **Funding Access**: Higher verification tiers unlock greater financial capabilities

## Wallets (Deposit Accounts)

### Purpose
Wallets are **deposit accounts** in Anchor's terminology that hold funds and can contain multiple pockets for budget categorization. According to [Anchor's deposit account overview](https://docs.getanchor.co/docs/overview-2), these are full-fledged bank accounts that can receive and hold funds.

### Endpoints

#### Create Wallet
```http
POST /api/wallets
Content-Type: application/json

{
  "customer_id": "cust_123abc",
  "currency": "USD",
  "metadata": {
    "trip_name": "Summer Europe 2024",
    "total_budget": 5000
  }
}
```

**Response**: Wallet data with unique ID and virtual account number

#### Get Wallet
```http
GET /api/wallets/{wallet_id}
```

**Response**: Wallet details, currency, and status

#### Get Wallet Balance
```http
GET /api/wallets/{wallet_id}/balance
```

**Response**: Available balance, pending balance, and hold balance

#### Get Wallet Account Numbers
```http
GET /api/wallets/{wallet_id}/account-numbers
```

**Response**: Virtual NUBANs for funding the wallet

#### Freeze Wallet
```http
PATCH /api/wallets/{wallet_id}/freeze
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

**Response**: Wallet frozen status

#### Unfreeze Wallet
```http
PATCH /api/wallets/{wallet_id}/unfreeze
```

**Response**: Wallet unfrozen status

### Supported Currencies
- **NGN** - Nigerian Naira
- **USD** - US Dollar

### Important Notes
- **KYC Requirement**: According to [Anchor's deposit account creation guide](https://docs.getanchor.co/docs/creating-deposit-account-resource), you **must complete KYC** before creating deposit accounts
- **Account Types**: Individual customers get `SAVINGS` accounts, business customers get `CURRENT` accounts
- **Virtual NUBANs**: Customers fund wallets via virtual account numbers, not the masked account numbers

### Use Cases
- **Trip Budget Management**: Create dedicated wallets for specific trips
- **Currency Handling**: Manage funds in traveler's preferred currency
- **Account Organization**: Separate financial accounts by trip or purpose
- **Security**: Freeze/unfreeze accounts for fraud prevention

## Pockets (Playbook-Specific Sub-Wallets)

### Purpose
Pockets are **playbook-specific sub-wallets** within the main wallet that have **restricted fund usage**. Money in a pocket can **only be used within that specific playbook** and cannot be transferred outside of it. This ensures budget discipline and prevents overspending across different trip plans.

### Endpoints

#### Create Pocket
```http
POST /api/pockets/{wallet_id}?playbookId={playbook_id}
Content-Type: application/json

{
  "name": "Flights",
  "type": "flights",
  "description": "Budget for flight tickets and airfare",
  "initial_amount": 1200,
  "color": "#3B82F6"
}
```

**Response**: Pocket data linked to specific playbook with restricted usage

#### Get Pocket Balance
```http
GET /api/pockets/{wallet_id}/balance?playbookId={playbook_id}
```

**Response**: Available balance for that specific playbook pocket

#### Transfer Between Pockets
```http
POST /api/pockets/{wallet_id}/transfer
Content-Type: application/json

{
  "source_playbook_id": "playbook_europe_2024",
  "target_playbook_id": "playbook_europe_2024",
  "source_pocket_name": "Flights",
  "target_pocket_name": "Hotels",
  "amount": 200,
  "description": "Reallocating budget from flights to hotels",
  "reason": "Flight prices dropped, moving savings to hotel budget"
}
```

**Response**: Transfer confirmation with playbook-specific transaction details

**Note**: Transfers can only happen **within the same playbook** to maintain fund restrictions.

### Use Cases
- **Playbook Budget Management**: Create dedicated budget categories for specific trips
- **Fund Restrictions**: Ensure money allocated to a playbook stays within that playbook
- **Budget Reallocation**: Move funds between categories within the same playbook
- **Expense Tracking**: Monitor spending per playbook and category
- **Financial Discipline**: Prevent overspending by isolating budgets per trip plan

## Complete Trip Planning Example

### 1. User Registration & KYC
```bash
# Step 1: Create customer profile (Tier 0)
curl -X POST http://localhost:3000/api/kyc/customers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@example.com",
    "phone": "07061234507",
    "address_line_1": "1, Victoria Island Street",
    "city": "Victoria Island",
    "state": "Lagos",
    "postal_code": "101241",
    "country": "NG"
  }'

# Step 2: Upgrade to Tier 1 for full funding access
curl -X POST http://localhost:3000/api/kyc/customers/{customer_id}/verify \
  -H "Content-Type: application/json" \
  -d '{
    "level": "TIER_1",
    "bvn": "22222324206",
    "date_of_birth": "1990-05-15",
    "gender": "Female"
  }'
```

### 2. Create Trip Wallet (Deposit Account)
```bash
# Create savings account for Europe trip
curl -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust_sarah_123",
    "currency": "NGN"
  }'

# Get virtual account numbers for funding
curl -X GET http://localhost:3000/api/wallets/{wallet_id}/account-numbers

# Check wallet balance
curl -X GET http://localhost:3000/api/wallets/{wallet_id}/balance
```

### 3. Set Up Budget Pockets (Playbook-Specific)
```bash
# Create budget categories for Europe 2024 playbook
curl -X POST "http://localhost:3000/api/pockets/wallet_europe_456?playbookId=playbook_europe_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flights",
    "type": "flights",
    "description": "Budget for flight tickets and airfare",
    "initial_amount": 1500,
    "color": "#3B82F6"
  }'

curl -X POST "http://localhost:3000/api/pockets/wallet_europe_456?playbookId=playbook_europe_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotels",
    "type": "hotels",
    "description": "Budget for accommodation",
    "initial_amount": 2000,
    "color": "#10B981"
  }'

curl -X POST "http://localhost:3000/api/pockets/wallet_europe_456?playbookId=playbook_europe_2024" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food & Activities",
    "type": "food",
    "description": "Budget for dining and entertainment",
    "initial_amount": 800,
    "color": "#F59E0B"
  }'

# Check pocket balance for specific playbook
curl -X GET "http://localhost:3000/api/pockets/wallet_europe_456/balance?playbookId=playbook_europe_2024"
```

### 4. Manage Budget (Within Playbook)
```bash
# Reallocate budget when flight prices drop (within same playbook)
curl -X POST http://localhost:3000/api/pockets/wallet_europe_456/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "source_playbook_id": "playbook_europe_2024",
    "target_playbook_id": "playbook_europe_2024",
    "source_pocket_name": "Flights",
    "target_pocket_name": "Food & Activities",
    "amount": 200,
    "description": "Flight savings moved to food budget",
    "reason": "Flight prices dropped, reallocating savings"
  }'
```

## API Structure & Requirements

### Anchor API Format
Our implementation automatically transforms your requests into Anchor's required JSON:API format:

**Your Request** → **Anchor's Expected Format**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Gets Transformed To**:
```json
{
  "data": {
    "type": "IndividualCustomer",
    "attributes": {
      "fullName": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "email": "john@example.com"
    }
  }
}
```

### Required Fields for KYC
- **Basic Info**: `first_name`, `last_name`, `email`, `phone`
- **Address**: `address_line_1`, `city`, `state`, `postal_code`, `country`
- **KYC Level 2** (recommended): `bvn`, `date_of_birth`, `gender`

### Phone Number Format
- **Format**: Nigerian phone format (e.g., "07061234507")
- **Not**: International format (e.g., "+2348012345678")

## Funding & Financial Operations

### How Funding Works

#### **1. Customer Onboarding Flow**
```
Tier 0 Registration → Basic Account Access → Limited Funding
         ↓
   Tier 1 Verification → Full Financial Services → Higher Limits
         ↓
   Tier 2 Verification → Maximum Limits → All Services
```

#### **2. Funding Sources**
- **Bank Transfers**: Customers can fund wallets via bank transfers to virtual account numbers
- **NIP Transfers**: Instant Nigerian Inter-Bank Payment transfers
- **External Deposits**: International transfers and deposits
- **Pocket Allocations**: Internal fund distribution between budget categories

#### **3. Virtual Account Numbers**
- Each wallet gets a unique virtual account number (Virtual NUBAN)
- Customers can share this number for deposits
- Funds are automatically credited to the wallet
- Real-time balance updates via webhooks

#### **4. Funding Limits by Tier**
- **Tier 0**: Basic limits (varies by Anchor's policy)
- **Tier 1**: Standard limits for most travel budgets
- **Tier 2**: Maximum limits for high-value trips

#### **5. Webhook Events for Funding**
Anchor sends real-time notifications for:
- `customer.identification.approved` - KYC verification successful
- `customer.identification.error` - KYC validation failed
- `customer.identification.rejected` - KYC rejected (requires updates)

### **Complete Trip Planning Flow with Anchor**

#### **Phase 1: Customer Onboarding**
1. **User registers** (Tier 0) → Basic account created
2. **User verifies with BVN** (Tier 1) → Full funding access unlocked
3. **KYC completion** → Required before creating deposit accounts

#### **Phase 2: Financial Account Setup**
4. **Create deposit account** → Savings account for individual customers
5. **Get virtual NUBANs** → Unique account numbers for funding
6. **Share account numbers** → Customers can fund via bank transfers

#### **Phase 3: Budget Management**
7. **Funds deposited** → Automatically credited to wallet
8. **Create budget pockets** → Categorize funds (flights, hotels, activities)
9. **Monitor balances** → Real-time tracking across categories
10. **Security controls** → Freeze/unfreeze accounts as needed

### **Critical Requirements**
- **KYC must be completed** before creating deposit accounts
- **Individual customers** get `SAVINGS` accounts only
- **Business customers** get `CURRENT` accounts only
- **Virtual NUBANs** are used for funding, not masked account numbers

### **Playbook-Specific Pockets Concept**
- **Each playbook has isolated pockets** with restricted fund usage
- **Funds cannot cross playbook boundaries** - they're locked to specific trips
- **Pockets are metadata within wallets** linked to playbook IDs
- **Transfers only allowed within the same playbook** to maintain restrictions
- **Budget discipline** is enforced at the playbook level

## Testing Guide

### **Quick Start Testing**

1. **Start the Application**
   ```bash
   npm run start:dev
   ```

2. **Test KYC Flow**
   ```bash
   # Create customer (Tier 0)
   curl -X POST http://localhost:3000/api/kyc/customers \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Test",
       "last_name": "User",
       "email": "test@example.com",
       "phone": "07061234507",
       "address_line_1": "1 Test Street",
       "city": "Lagos",
       "state": "Lagos",
       "postal_code": "100001",
       "country": "NG"
     }'
   
   # Store customer ID from response
   CUSTOMER_ID="your_customer_id_here"
   
   # Upgrade to Tier 1
   curl -X POST http://localhost:3000/api/kyc/customers/$CUSTOMER_ID/verify \
     -H "Content-Type: application/json" \
     -d '{
       "level": "TIER_1",
       "bvn": "22222222200",
       "date_of_birth": "1990-01-01",
       "gender": "Male"
     }'
   ```

3. **Test Wallet Creation**
   ```bash
   # Create wallet (deposit account)
   curl -X POST http://localhost:3000/api/wallets \
     -H "Content-Type: application/json" \
     -d '{
       "customer_id": "'$CUSTOMER_ID'",
       "currency": "NGN"
     }'
   
   # Store wallet ID from response
   WALLET_ID="your_wallet_id_here"
   ```

4. **Test Playbook-Specific Pockets**
   ```bash
   # Create pocket for Europe 2024 playbook
   curl -X POST "http://localhost:3000/api/pockets/$WALLET_ID?playbookId=playbook_europe_2024" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Flights",
       "type": "flights",
       "description": "Budget for flight tickets",
       "initial_amount": 1500,
       "color": "#3B82F6"
     }'
   
   # Check pocket balance
   curl -X GET "http://localhost:3000/api/pockets/$WALLET_ID/balance?playbookId=playbook_europe_2024"
   ```

5. **Test Pocket Transfers (Same Playbook Only)**
   ```bash
   curl -X POST http://localhost:3000/api/pockets/$WALLET_ID/transfer \
     -H "Content-Type: application/json" \
     -d '{
       "source_playbook_id": "playbook_europe_2024",
       "target_playbook_id": "playbook_europe_2024",
       "source_pocket_name": "Flights",
       "target_pocket_name": "Hotels",
       "amount": 200,
       "description": "Reallocating budget",
       "reason": "Flight savings"
     }'
   ```

### **What to Test**

- ✅ **KYC Flow**: Customer creation → Verification → Wallet creation
- ✅ **Fund Restrictions**: Pockets isolated per playbook
- ✅ **Transfer Logic**: Only same-playbook transfers allowed
- ✅ **Balance Tracking**: Per-playbook balance monitoring
- ✅ **Error Handling**: Invalid requests, missing fields, etc.

## Environment Configuration

Create a `.env` file with your Anchor credentials:

```bash
# Anchor API Configuration
ANCHOR_API_BASE=https://api.sandbox.getanchor.co
ANCHOR_API_KEY=your_sandbox_or_live_api_key_here

# Server Configuration
PORT=3000
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Anchor API access

### Installation
```bash
npm install
```

### Running the Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## API Response Examples

### Successful Customer Creation
```json
{
  "id": "cust_abc123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "status": "verified",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Successful Wallet Creation
```json
{
  "id": "wallet_xyz789",
  "customer_id": "cust_abc123",
  "currency": "USD",
  "balance": 0,
  "virtual_account": "1234567890",
  "created_at": "2024-01-15T10:35:00Z"
}
```

### Successful Transfer
```json
{
  "id": "transfer_def456",
  "source_pocket_id": "pocket_flights_123",
  "target_pocket_id": "pocket_hotels_456",
  "amount": 200,
  "status": "completed",
  "created_at": "2024-01-15T11:00:00Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid API key
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server or Anchor API error

## Security Features

- **Input Validation**: All requests validated using `class-validator`
- **Authentication**: Global Clerk authentication guard
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables

## Support

For technical support:
- **Anchor API**: [docs.getanchor.co](https://docs.getanchor.co)
- **Project Issues**: Create an issue in the project repository

## License

This project is proprietary and confidential.

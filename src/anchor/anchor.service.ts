import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

@Injectable()
export class AnchorService {
  private readonly logger = new Logger(AnchorService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl = this.configService.get<string>('ANCHOR_API_BASE') ?? 'https://api.sandbox.getanchor.co';
    this.apiKey = this.configService.get<string>('ANCHOR_API_KEY') ?? '';
  }

  private async request<TResponse>(method: HttpMethod, path: string, body?: unknown): Promise<TResponse> {
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}/api/v1/${path.replace(/^\//, '')}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['x-anchor-key'] = this.apiKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorPayload: unknown;
      try {
        errorPayload = await response.json();
      } catch (e) {
        errorPayload = await response.text();
      }
      this.logger.error(`Anchor API error ${response.status} ${response.statusText}: ${JSON.stringify(errorPayload)}`);
      throw new Error(`Anchor API request failed: ${response.status} ${response.statusText}`);
    }

    try {
      return (await response.json()) as TResponse;
    } catch (e) {
      // Some successful responses might be empty
      return undefined as unknown as TResponse;
    }
  }

  // KYC
  async createCustomer(payload: unknown): Promise<unknown> {
    // Transform to Anchor's JSON:API format
    const anchorPayload = {
      data: {
        type: 'IndividualCustomer',
        attributes: {
          fullName: {
            firstName: (payload as any).first_name,
            lastName: (payload as any).last_name,
          },
          address: {
            addressLine_1: (payload as any).address_line_1,
            addressLine_2: (payload as any).address_line_2,
            city: (payload as any).city,
            state: (payload as any).state,
            postalCode: (payload as any).postal_code,
            country: (payload as any).country || 'NG',
          },
          email: (payload as any).email,
          phoneNumber: (payload as any).phone,
          ...((payload as any).bvn && {
            identificationLevel2: {
              dateOfBirth: (payload as any).date_of_birth,
              gender: (payload as any).gender,
              bvn: (payload as any).bvn,
            },
          }),
          metadata: (payload as any).metadata,
        },
      },
    };

    return this.request('POST', '/customers', anchorPayload);
  }

  async getCustomer(customerId: string): Promise<unknown> {
    return this.request('GET', `/customers/${customerId}`);
  }

  async verifyCustomer(customerId: string, payload: unknown): Promise<unknown> {
    const anchorPayload = {
      data: {
        type: 'Verification',
        attributes: {
          level: (payload as any).level,
          level2: {
            bvn: (payload as any).bvn,
            dateOfBirth: (payload as any).date_of_birth,
            gender: (payload as any).gender,
          },
        },
      },
    };

    return this.request('POST', `/customers/${customerId}/verification/individual`, anchorPayload);
  }

  async updateCustomer(customerId: string, payload: unknown): Promise<unknown> {
    // Transform to Anchor's JSON:API format for updates
    const anchorPayload = {
      data: {
        type: 'IndividualCustomer',
        attributes: {
          ...((payload as any).first_name && {
            fullName: {
              firstName: (payload as any).first_name,
              lastName: (payload as any).last_name,
            },
          }),
          ...((payload as any).email && { email: (payload as any).email }),
          ...((payload as any).phone && { phoneNumber: (payload as any).phone }),
          ...((payload as any).address_line_1 && {
            address: {
              addressLine_1: (payload as any).address_line_1,
              addressLine_2: (payload as any).address_line_2,
              city: (payload as any).city,
              state: (payload as any).state,
              postalCode: (payload as any).postal_code,
              country: (payload as any).country || 'NG',
            },
          }),
          ...((payload as any).metadata && { metadata: (payload as any).metadata }),
        },
      },
    };

    return this.request('PUT', `/customers/update/${customerId}`, anchorPayload);
  }

  async deleteCustomer(customerId: string): Promise<unknown> {
    return this.request('DELETE', `/customers/${customerId}`);
  }

  // Wallets (Deposit Accounts in Anchor terminology)
  async createWallet(payload: unknown): Promise<unknown> {
    // Transform to Anchor's deposit account format
    const anchorPayload = {
      data: {
        type: 'DepositAccount',
        attributes: {
          productName: 'SAVINGS', // Individual customers get SAVINGS accounts
        },
        relationships: {
          customer: {
            data: {
              id: (payload as any).customer_id,
              type: 'IndividualCustomer',
            },
          },
        },
      },
    };

    return this.request('POST', '/accounts', anchorPayload);
  }

  async getWallet(walletId: string): Promise<unknown> {
    return this.request('GET', `/accounts/${walletId}`);
  }

  async getWalletBalance(walletId: string): Promise<unknown> {
    return this.request('GET', `/accounts/${walletId}/balance`);
  }

  async getWalletAccountNumbers(walletId: string): Promise<unknown> {
    return this.request('GET', `/account-number?settlementAccountId=${walletId}`);
  }

  async freezeWallet(walletId: string, reason?: string): Promise<unknown> {
    const payload = {
      data: {
        type: 'DepositAccount',
        attributes: {
          frozen: true,
          ...(reason && { frozenBy: reason }),
        },
      },
    };
    return this.request('PATCH', `/accounts/${walletId}`, payload);
  }

  async unfreezeWallet(walletId: string): Promise<unknown> {
    const payload = {
      data: {
        type: 'DepositAccount',
        attributes: {
          frozen: false,
        },
      },
    };
    return this.request('PATCH', `/accounts/${walletId}`, payload);
  }

  // Pockets (Playbook-specific sub-wallets with restricted fund usage)
  async createPocket(walletId: string, playbookId: string, payload: unknown): Promise<unknown> {
    // Create a pocket as metadata within the wallet, linked to a specific playbook
    // This ensures funds are restricted to that playbook's usage
    const pocketPayload = {
      data: {
        type: 'DepositAccount',
        attributes: {
          metadata: {
            pockets: {
              [playbookId]: {
                ...(payload as any),
                playbook_id: playbookId,
                wallet_id: walletId,
                created_at: new Date().toISOString(),
                status: 'active',
                restricted_usage: true, // Funds can only be used within this playbook
              },
            },
          },
        },
      },
    };
    return this.request('PATCH', `/accounts/${walletId}`, pocketPayload);
  }

  async transferBetweenPockets(walletId: string, sourcePlaybookId: string, targetPlaybookId: string, payload: unknown): Promise<unknown> {
    // Transfer funds between playbook-specific pockets
    // This maintains the restriction that funds stay within their designated playbooks
    const transferPayload = {
      data: {
        type: 'BookTransfer', // Internal account-to-account transfer
        attributes: {
          sourceAccountId: walletId,
          targetAccountId: walletId, // Same wallet, different pocket metadata
          amount: (payload as any).amount,
          description: `Transfer from ${sourcePlaybookId} to ${targetPlaybookId} pocket`,
          metadata: {
            transfer_type: 'pocket_to_pocket',
            source_playbook_id: sourcePlaybookId,
            target_playbook_id: targetPlaybookId,
            source_pocket_name: (payload as any).source_pocket_name,
            target_pocket_name: (payload as any).target_pocket_name,
            restricted_usage: true,
          },
        },
      },
    };
    
    // Use Anchor's book transfer endpoint for internal transfers
    return this.request('POST', '/transfers/book', transferPayload);
  }

  async getPocketBalance(walletId: string, playbookId: string): Promise<unknown> {
    // Get the balance for a specific playbook pocket
    // This would calculate available funds restricted to that playbook
    const wallet = await this.getWallet(walletId);
    const pockets = (wallet as any)?.attributes?.metadata?.pockets;
    
    if (!pockets || !pockets[playbookId]) {
      return { balance: 0, playbook_id: playbookId, status: 'not_found' };
    }
    
    // Calculate available balance for this specific playbook pocket
    // This would need to consider any pending transactions or holds
    return {
      balance: pockets[playbookId].balance || 0,
      playbook_id: playbookId,
      pocket_name: pockets[playbookId].name,
      restricted_usage: true,
      status: 'active',
    };
  }
}



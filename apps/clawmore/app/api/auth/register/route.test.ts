import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const { mockSendWelcomeEmail, mockQuery, mockPut, mockUpdate } = vi.hoisted(
  () => ({
    mockSendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    mockQuery: vi.fn(),
    mockPut: vi.fn(),
    mockUpdate: vi.fn(),
  })
);

vi.mock('@aws-sdk/client-dynamodb', () => {
  class MockDynamoDBClient {
    constructor() {}
  }
  return { DynamoDBClient: MockDynamoDBClient };
});

vi.mock('@aws-sdk/lib-dynamodb', () => {
  class MockDocument {
    query = mockQuery;
    put = mockPut;
    update = mockUpdate;
  }
  return { DynamoDBDocument: { from: () => new MockDocument() } };
});

vi.mock('../../../../lib/email', () => ({
  sendWelcomeEmail: mockSendWelcomeEmail,
}));

vi.mock('../../../../lib/logger', () => {
  const noop = vi.fn();
  return {
    createLogger: () => ({ info: noop, error: noop, warn: noop, debug: noop }),
  };
});

import { POST } from './route';

function createRequest(body: Record<string, unknown>) {
  return { json: async () => body } as any;
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ Items: [] });
    mockPut.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});
    mockSendWelcomeEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reject invalid email', async () => {
    const res = await POST(createRequest({ email: 'bad', name: 'T' }));
    expect(res.status).toBe(400);
  });

  it('should reject empty name', async () => {
    const res = await POST(createRequest({ email: 'a@b.com', name: '' }));
    expect(res.status).toBe(400);
  });

  it('should reject missing fields', async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
  });

  it('should create a new user and send welcome email', async () => {
    const res = await POST(
      createRequest({ email: 'new@example.com', name: 'New' })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.userId).toBeDefined();
    expect(mockPut).toHaveBeenCalledTimes(2);
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith('new@example.com', 'New');
  });

  it('should normalize email to lowercase', async () => {
    await POST(createRequest({ email: 'UP@X.COM', name: 'T' }));

    const userPut = mockPut.mock.calls[0][0];
    expect(userPut.Item.email).toBe('up@x.com');
  });

  it('should return 409 for approved user', async () => {
    mockQuery.mockResolvedValue({
      Items: [{ PK: 'USER#abc', status: 'APPROVED' }],
    });
    const res = await POST(createRequest({ email: 'ex@x.com', name: 'E' }));
    expect(res.status).toBe(409);
  });

  it('should update name for pending user', async () => {
    mockQuery.mockResolvedValue({
      Items: [{ PK: 'USER#abc', status: 'PENDING' }],
    });
    const res = await POST(
      createRequest({ email: 'p@x.com', name: 'Updated' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe('abc');
  });

  it('should create metadata with $5 initial credit', async () => {
    await POST(createRequest({ email: 'c@x.com', name: 'C' }));
    const metaPut = mockPut.mock.calls[1][0];
    expect(metaPut.Item.aiTokenBalanceCents).toBe(500);
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoClient, ObjectId } from 'mongodb';
import { getDb } from '../../../lib/db';
import { UserCollection } from '../../../models/User';
import { GatheringCollection } from '../../../models/Gathering';
import { ItemCollection } from '../../../models/Item';
import { InviteCollection } from '../../../models/Invite';
import { handler } from '../../../pages/api/auth/delete-account';
import type { NextApiResponse } from 'next';

// Mock the withAuth middleware to directly call the handler
// We'll pass userId directly in the request
interface TestRequest {
  method: string;
  userId?: string;
}

interface TestResponse extends NextApiResponse {
  statusCode: number;
  jsonData: any;
  status: (code: number) => TestResponse;
  json: (data: any) => TestResponse;
}

function createMockResponse(): TestResponse {
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status: function (code: number) {
      this.statusCode = code;
      return this;
    },
    json: function (data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

function createMockRequest(method: string, userId: string): TestRequest {
  return {
    method,
    userId,
  } as TestRequest;
}

let testDb: any;
let testUserId: ObjectId;
let otherUserId: ObjectId;
let testGatheringId: ObjectId;
let otherGatheringId: ObjectId;
let testItemId: ObjectId;
let testInviteId: ObjectId;

// Setup: Create test data before each test
test.beforeEach(async () => {
    const db = await getDb();
    testDb = db;

    // Create test user
    const testUserResult = await db.collection(UserCollection).insertOne({
      phoneNumber: '+15501111111',
      createdAt: new Date(),
    });
    testUserId = testUserResult.insertedId;

    // Create another user for testing isolation
    const otherUserResult = await db.collection(UserCollection).insertOne({
      phoneNumber: '+15502222222',
      createdAt: new Date(),
    });
    otherUserId = otherUserResult.insertedId;

    // Create a gathering owned by test user
    const testGatheringResult = await db
      .collection(GatheringCollection)
      .insertOne({
        name: 'Test Gathering',
        date: '2024-12-25',
        time: '18:00',
        address: '123 Test St',
        hostId: testUserId,
        createdAt: new Date(),
      });
    testGatheringId = testGatheringResult.insertedId;

    // Create a gathering owned by other user
    const otherGatheringResult = await db
      .collection(GatheringCollection)
      .insertOne({
        name: 'Other Gathering',
        date: '2024-12-26',
        time: '19:00',
        address: '456 Other St',
        hostId: otherUserId,
        createdAt: new Date(),
      });
    otherGatheringId = otherGatheringResult.insertedId;

    // Create an item in test user's gathering
    const testItemResult = await db.collection(ItemCollection).insertOne({
      name: 'Test Item',
      type: 'food',
      gatheringId: testGatheringId,
      createdAt: new Date(),
    });
    testItemId = testItemResult.insertedId;

    // Create an item claimed by test user in other user's gathering
    await db.collection(ItemCollection).insertOne({
      name: 'Claimed Item',
      type: 'drink',
      gatheringId: otherGatheringId,
      claimedBy: testUserId,
      claimedByName: 'Test User',
      createdAt: new Date(),
    });

    // Create an invite with test user in acceptedUserIds
    const testInviteResult = await db.collection(InviteCollection).insertOne({
      gatheringId: otherGatheringId,
      status: 'accepted',
      acceptedUserIds: [testUserId, otherUserId],
      createdAt: new Date(),
    });
    testInviteId = testInviteResult.insertedId;
});

// Cleanup: Remove test data after each test
test.afterEach(async () => {
    if (testDb) {
      try {
        await testDb.collection(UserCollection).deleteMany({
          phoneNumber: { $in: ['+15501111111', '+15502222222'] },
        });
        await testDb.collection(GatheringCollection).deleteMany({
          name: { $in: ['Test Gathering', 'Other Gathering'] },
        });
        await testDb.collection(ItemCollection).deleteMany({
          name: { $in: ['Test Item', 'Claimed Item'] },
        });
        await testDb.collection(InviteCollection).deleteMany({
          _id: testInviteId,
        });
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
});

test('should delete account with no associated data', async () => {
    // Create a user with no data
    const db = await getDb();
    const cleanUserResult = await db.collection(UserCollection).insertOne({
      phoneNumber: '+15509999999',
      createdAt: new Date(),
    });
    const cleanUserId = cleanUserResult.insertedId;

    const req = createMockRequest('DELETE', cleanUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);

    // Verify user is deleted
    const deletedUser = await db
      .collection(UserCollection)
      .findOne({ _id: cleanUserId });
    assert.equal(deletedUser, null);

    // Cleanup
    await db.collection(UserCollection).deleteOne({ _id: cleanUserId });
});

test('should delete account and all user gatherings', async () => {
    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);

    // Verify user is deleted
    const deletedUser = await testDb
      .collection(UserCollection)
      .findOne({ _id: testUserId });
    assert.equal(deletedUser, null);

    // Verify user's gathering is deleted
    const deletedGathering = await testDb
      .collection(GatheringCollection)
      .findOne({ _id: testGatheringId });
    assert.equal(deletedGathering, null);

    // Verify other user's gathering still exists
    const otherGathering = await testDb
      .collection(GatheringCollection)
      .findOne({ _id: otherGatheringId });
    assert.notEqual(otherGathering, null);
});

test('should delete items in user gatherings', async () => {
    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);

    // Verify item in user's gathering is deleted
    const deletedItem = await testDb
      .collection(ItemCollection)
      .findOne({ _id: testItemId });
    assert.equal(deletedItem, null);
});

test('should unclaim items claimed by user', async () => {
    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);

    // Verify claimed item is unclaimed (not deleted, but unclaimed)
    const unclaimedItem = await testDb.collection(ItemCollection).findOne({
      name: 'Claimed Item',
    });
    assert.notEqual(unclaimedItem, null);
    assert.equal(unclaimedItem.claimedBy, undefined);
    assert.equal(unclaimedItem.claimedByName, undefined);
});

test('should remove user from invites acceptedUserIds', async () => {
    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);

    // Verify user is removed from invite
    const invite = await testDb
      .collection(InviteCollection)
      .findOne({ _id: testInviteId });
    assert.notEqual(invite, null);
    assert.ok(!invite.acceptedUserIds?.some((id: ObjectId) => id.equals(testUserId)));
    // Other user should still be in the list
    assert.ok(invite.acceptedUserIds?.some((id: ObjectId) => id.equals(otherUserId)));
});

test('should return 404 if user does not exist', async () => {
    const nonExistentId = new ObjectId();
    const req = createMockRequest('DELETE', nonExistentId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 404);
    assert.ok(res.jsonData.error?.includes('not found'));
});

test('should return 405 for non-DELETE methods', async () => {
    const req = createMockRequest('GET', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.jsonData.error, 'Method not allowed');
});

test('should handle account with multiple gatherings', async () => {
    const db = await getDb();

    // Create additional gatherings for test user
    const gathering2Result = await db.collection(GatheringCollection).insertOne({
      name: 'Test Gathering 2',
      date: '2024-12-27',
      time: '20:00',
      address: '789 Another St',
      hostId: testUserId,
      createdAt: new Date(),
    });
    const gathering2Id = gathering2Result.insertedId;

    const gathering3Result = await db.collection(GatheringCollection).insertOne({
      name: 'Test Gathering 3',
      date: '2024-12-28',
      time: '21:00',
      address: '321 Yet Another St',
      hostId: testUserId,
      createdAt: new Date(),
    });
    const gathering3Id = gathering3Result.insertedId;

    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);

    // Verify all gatherings are deleted
    const gathering2 = await db
      .collection(GatheringCollection)
      .findOne({ _id: gathering2Id });
    assert.equal(gathering2, null);

    const gathering3 = await db
      .collection(GatheringCollection)
      .findOne({ _id: gathering3Id });
    assert.equal(gathering3, null);
});

test('should handle account with items in multiple gatherings', async () => {
    const db = await getDb();

    // Create another gathering
    const gathering2Result = await db.collection(GatheringCollection).insertOne({
      name: 'Test Gathering 2',
      date: '2024-12-27',
      time: '20:00',
      address: '789 Another St',
      hostId: testUserId,
      createdAt: new Date(),
    });
    const gathering2Id = gathering2Result.insertedId;

    // Create items in both gatherings
    await db.collection(ItemCollection).insertOne({
      name: 'Item 1',
      type: 'food',
      gatheringId: testGatheringId,
      createdAt: new Date(),
    });

    await db.collection(ItemCollection).insertOne({
      name: 'Item 2',
      type: 'drink',
      gatheringId: gathering2Id,
      createdAt: new Date(),
    });

    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    assert.equal(res.statusCode, 200);

    // Verify all items are deleted
    const items = await db.collection(ItemCollection).find({
      name: { $in: ['Item 1', 'Item 2'] },
    }).toArray();
    assert.equal(items.length, 0);
});

test('should complete deletion in reasonable time', async () => {
    const startTime = Date.now();
    const req = createMockRequest('DELETE', testUserId.toString());
    const res = createMockResponse();

    await handler(req as any, res);

    const duration = Date.now() - startTime;
    
    assert.equal(res.statusCode, 200);
    // Should complete in less than 5 seconds even with test data
    assert.ok(duration < 5000, `Deletion took ${duration}ms, expected < 5000ms`);
});

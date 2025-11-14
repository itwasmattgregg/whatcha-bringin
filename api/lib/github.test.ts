import test from 'node:test';
import assert from 'node:assert/strict';
import { _test_only_buildIssueTitle } from './github';

test('returns default title when summary empty', () => {
  const title = _test_only_buildIssueTitle('');
  assert.equal(title, 'Bug: Support form submission');
});

test('uses first sentence and trims whitespace', () => {
  const title = _test_only_buildIssueTitle(
    '  Something broke here. Additional info follows.'
  );
  assert.equal(title, 'Bug: Something broke here.');
});

test('clips long sentences with ellipsis and length cap', () => {
  const longSentence = 'A'.repeat(200);
  const title = _test_only_buildIssueTitle(longSentence);
  assert.ok(title.startsWith('Bug: '));
  assert.ok(title.endsWith('…'));
  assert.ok(title.length <= 80);
});

test('supports custom prefix', () => {
  const title = _test_only_buildIssueTitle(
    'Need dark mode soon please',
    'Feature request'
  );
  assert.equal(title, 'Feature request: Need dark mode soon please');
});

test('falls back to default text with custom prefix when summary empty', () => {
  const title = _test_only_buildIssueTitle('', 'Feature');
  assert.equal(title, 'Feature: Support form submission');
});

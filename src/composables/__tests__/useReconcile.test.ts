import { expect, mock, test } from 'bun:test'

const mockResponse = {
  q0: { result: [{ id: 'Q1', name: 'Test', description: 'desc', score: 90, match: false }] },
  q1: { result: [] },
}

test('reconcile populates results and auto-selects single match', async () => {
  global.fetch = mock(() =>
    Promise.resolve({ json: () => Promise.resolve(mockResponse) }),
  ) as unknown as typeof fetch

  const { useReconcile } = await import('../useReconcile')
  const { reconcile, reconcileResults, selectedQids } = useReconcile()
  await reconcile([
    { title: 'Title_One', subcats: 0, files: 0, pages: 0, total: 0 },
    { title: 'Title_Two', subcats: 0, files: 0, pages: 0, total: 0 },
  ])
  expect(reconcileResults.value['Title_One']).toHaveLength(1)
  expect(selectedQids.value['Title_One']).toBe('Q1')
  expect(reconcileResults.value['Title_Two']).toHaveLength(0)
  expect(selectedQids.value['Title_Two']).toBeUndefined()
})

test('toggleSelect selects then deselects', async () => {
  const { useReconcile } = await import('../useReconcile')
  const { toggleSelect, selectedQids } = useReconcile()
  toggleSelect('My_Cat', 'Q5')
  expect(selectedQids.value['My_Cat']).toBe('Q5')
  toggleSelect('My_Cat', 'Q5')
  expect(selectedQids.value['My_Cat']).toBeUndefined()
})

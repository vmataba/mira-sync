import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Basic sanity tests around task creation & progress updates.

describe('Goal & Task Planner', () => {
  it('allows creating a new task', async () => {
    render(<App />)

    // Open dialog
    const newTaskButton = screen.getByLabelText(/add task/i)
    fireEvent.click(newTaskButton)

    const titleInput = await screen.findByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'My first task' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    const createdTask = await screen.findByText('My first task')
    expect(createdTask).toBeInTheDocument()
  })

  it('shows progress percentage for tasks', async () => {
    render(<App />)

    const newTaskButton = screen.getByLabelText(/add task/i)
    fireEvent.click(newTaskButton)

    const titleInput = await screen.findByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Task with progress' } })

    const progressInput = screen.getByLabelText(/progress/i)
    fireEvent.change(progressInput, { target: { value: '75' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    const taskItem = await screen.findByText('Task with progress')
    expect(taskItem).toBeInTheDocument()
    expect(screen.getByText(/75%/)).toBeInTheDocument()
  })
})

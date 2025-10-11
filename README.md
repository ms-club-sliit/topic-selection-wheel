# Topic Selector Wheel

An interactive spinning wheel application for MiniHackathon 2025 to randomly select topics with celebration animations, built with React and Vite.

## Features

- **Spinning Wheel**: Beautiful animated wheel with custom color scheme matching the event branding
- **Smart Spin Button**: Positioned on the left side for easy access
- **Celebration Modal**: Popup with confetti, balloons, and ribbons when a topic is selected
- **Topic Names**: Upload JSON file to map topic numbers to descriptive names
- **Retry System**: Single retry segment with configurable probability (0-50%) that controls landing chance
- **Smart Exclusion**: Selected topics are automatically excluded from future spins
- **Manual Exclusion**: Click any topic number to manually exclude it from the wheel
- **Session Management**: All settings and state persist via localStorage across page refreshes
- **Selection History**: Track previously selected topics with timestamps
- **Collapsible Settings Menu**: Side panel that starts closed by default

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Topic Names JSON Format

Upload a JSON file to assign names to topic numbers. See `sample-topics.json` for an example.

**Format:**
```json
{
  "1": "Introduction to Web Development",
  "2": "Advanced JavaScript Concepts",
  "3": "React Fundamentals",
  "15": "Performance Optimization"
}
```

**Rules:**
- Keys must be numbers (as strings)
- Values must be topic name strings
- Only numbers with names in the JSON will display names in the celebration popup
- Numbers without mappings will show only the number

## How to Use

1. **Configure Settings** (click settings icon in top-right corner):
   - **Upload Topic Names**: Optional JSON file to add descriptive names to topics
   - **Topic Count**: Set how many topics (3-30) should appear on the wheel
   - **Retry Probability**: Set 0-50% chance to land on the retry segment
   - **Exclude Topics**: Click green/red buttons to manually include/exclude specific topics
   - **Reset All**: Clear all exclusions and start over

2. **Spin the Wheel**:
   - Click the "SPIN THE WHEEL!" button on the left side
   - Watch the wheel spin for 4 seconds with smooth animation
   - Pointer at the top indicates where the wheel will stop

3. **View Results**:
   - **Regular Topic**: Shows the topic number in large gradient text
     - If a topic name exists in your JSON file, it displays below the number
     - Message: "MiniHackathon 2025 - Let's Build Something Amazing!"
   - **Retry**: Shows "RETRY!" message - spin again without excluding any topic
   - Selected topics are automatically excluded from future spins (except retry)

4. **Session Persistence**:
   - All settings are saved automatically to browser localStorage
   - Refresh the page and continue where you left off
   - View selection history in the settings panel

## Sample Topics

A sample JSON file (`sample-topics.json`) is included with 20 example topics covering various tech subjects. Use it as a template for your own topic lists!

## Tech Stack

- **React 18**: UI framework with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling and animations
- **Canvas API**: Dynamic wheel rendering with custom colors
- **localStorage**: Client-side session persistence

## Color Scheme

The wheel uses a custom color palette matching the event branding:
- Red: #D53F34
- Yellow/Gold: #E4AB09
- Green: #31994E
- Blue: #3F7ADF

## How Retry Works

Unlike traditional wheels with multiple retry segments, this implementation:
- Displays exactly **1 retry segment** on the wheel (when probability > 0)
- The **probability setting** controls the chance of landing on it
- Example: 20% probability = 20% chance the wheel stops on retry
- Landing on retry does NOT exclude any topics
- All other spins land on available topic numbers

## License

MIT

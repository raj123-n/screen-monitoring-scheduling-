# Activity Tracking Features Documentation

## 🎯 **Overview**

This document describes the comprehensive activity tracking system implemented in the digital wellness application. The system tracks various user interactions with privacy-focused data collection and real-time analytics.

## 🚀 **Implemented Features**

### 1. **Mouse Movement Tracking**
- **Coordinates**: x, y (client coordinates)
- **Page Coordinates**: pageX, pageY (optional)
- **Throttling**: Configurable throttle interval (default: 100ms)
- **Velocity Calculation**: Real-time velocity estimation in pixels per millisecond
- **Performance**: Optimized with throttling to prevent excessive data collection

### 2. **Click Event Tracking**
- **Position**: x, y coordinates
- **Target Information**: CSS selector and element ID
- **Button Type**: Left, right, middle mouse buttons
- **Modifiers**: Ctrl, Shift, Alt, Meta key states
- **Timestamp**: Precise timing of each click

### 3. **Hover Event Tracking**
- **Target Element**: CSS selector of hovered element
- **Timing**: Enter time, leave time, dwell duration
- **Dwell Analysis**: Time spent hovering over elements
- **Real-time Status**: Current hover state tracking

### 4. **Scroll Activity Tracking**
- **Position**: scrollTop and scroll percentage
- **Direction**: Up/down scroll detection
- **Speed**: Scroll velocity in pixels per second
- **Pattern Analysis**: Scroll behavior patterns

### 5. **Keyboard Activity (Privacy Mode)**
- **Category Only**: Typing, navigation, shortcuts, other
- **No Raw Keys**: Privacy-focused approach
- **Optional**: Can be enabled/disabled by user
- **Pattern Recognition**: Keyboard usage patterns

### 6. **Visibility & Focus Tracking**
- **Page Visibility**: Document hidden/visible state
- **Window Focus**: Browser window focus/blur
- **Context Awareness**: Understanding user attention

### 7. **Idle Detection**
- **Configurable Threshold**: Default 30 seconds
- **Idle Periods**: Start time, end time, duration
- **Activity Reset**: Automatic idle timer reset on activity

## 🔧 **Technical Implementation**

### Custom Hook: `useActivityTracker`

```typescript
const { activityData, getActivityStats, resetActivity } = useActivityTracker({
  throttleInterval: 100,    // Mouse move throttling
  idleThreshold: 30000,     // Idle detection (30s)
  maxEvents: 1000,          // Maximum events to store
  enableKeydown: false,     // Privacy mode for keyboard
});
```

### Data Structures

#### MouseMoveEvent
```typescript
interface MouseMoveEvent {
  x: number;              // Client X coordinate
  y: number;              // Client Y coordinate
  pageX?: number;         // Page X coordinate
  pageY?: number;         // Page Y coordinate
  timestamp: number;      // Event timestamp
  velocity?: number;      // Calculated velocity
}
```

#### ClickEvent
```typescript
interface ClickEvent {
  x: number;              // Click X coordinate
  y: number;              // Click Y coordinate
  targetSelector: string; // CSS selector of target
  elementId?: string;     // Element ID if available
  button: number;         // Mouse button (0=left, 1=middle, 2=right)
  modifiers: {            // Keyboard modifiers
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  timestamp: number;      // Event timestamp
}
```

#### HoverEvent
```typescript
interface HoverEvent {
  target: string;         // CSS selector of hovered element
  enterTime: number;      // Hover start timestamp
  leaveTime?: number;     // Hover end timestamp
  dwellMs?: number;       // Total dwell time in milliseconds
}
```

#### ScrollEvent
```typescript
interface ScrollEvent {
  scrollTop: number;      // Current scroll position
  scrollPct: number;      // Scroll percentage (0-100)
  direction: 'up' | 'down'; // Scroll direction
  speed: number;          // Scroll speed in px/s
  timestamp: number;      // Event timestamp
}
```

#### KeydownEvent (Privacy Mode)
```typescript
interface KeydownEvent {
  category: 'typing' | 'navigation' | 'shortcut' | 'other';
  timestamp: number;      // Event timestamp
}
```

#### VisibilityEvent
```typescript
interface VisibilityEvent {
  visible: boolean;       // Page visibility state
  focused: boolean;       // Window focus state
  timestamp: number;      // Event timestamp
}
```

#### IdleEvent
```typescript
interface IdleEvent {
  idleStart: number;      // Idle period start
  idleEnd?: number;       // Idle period end
  idleMs?: number;        // Total idle duration
}
```

## 📊 **Analytics & Statistics**

### Real-Time Statistics
- **Mouse Moves per Minute**: Recent mouse activity rate
- **Clicks per Minute**: Click frequency analysis
- **Scrolls per Minute**: Scroll activity rate
- **Average Velocity**: Mouse movement speed
- **Total Events**: Cumulative event count
- **Activity Level**: Overall user engagement

### Performance Metrics
- **Focus Score**: Based on activity patterns
- **Idle Detection**: Inactivity periods
- **Velocity Analysis**: Movement speed patterns
- **Event Distribution**: Activity type breakdown

## 🎨 **User Interface Components**

### 1. **MouseActivityTracker Page**
- **Route**: `/mouse-activity`
- **Features**: Comprehensive activity dashboard
- **Tabs**: Overview, Mouse Activity, Clicks & Hovers, Scroll Analysis, System Events
- **Charts**: Real-time data visualization
- **Controls**: Start/pause tracking, reset data, export

### 2. **ActivityDemo Component**
- **Location**: Home page integration
- **Features**: Live activity demonstration
- **Real-time Updates**: Live statistics and event feed
- **Interactive Controls**: Toggle tracking, privacy settings

### 3. **Navigation Integration**
- **Menu Item**: "Mouse Activity" in main navigation
- **Access**: Direct link to tracking dashboard

## 🔒 **Privacy & Security Features**

### Privacy-First Design
- **Local Storage**: All data stays on user's device
- **No Raw Keys**: Keyboard tracking only captures categories
- **User Control**: Enable/disable specific tracking features
- **Data Export**: User-controlled data export
- **Reset Functionality**: Complete data clearing

### Security Measures
- **Throttling**: Prevents excessive data collection
- **Event Limits**: Maximum event storage limits
- **Memory Management**: Automatic cleanup of old events
- **Performance Optimization**: Efficient event handling

## 🚀 **Usage Examples**

### Basic Implementation
```typescript
import { useActivityTracker } from "@/hooks/useActivityTracker";

function MyComponent() {
  const { activityData, getActivityStats } = useActivityTracker();
  const stats = getActivityStats();
  
  return (
    <div>
      <p>Mouse moves per minute: {stats.mouseMovesLastMinute}</p>
      <p>Total events: {stats.totalEvents}</p>
    </div>
  );
}
```

### Advanced Configuration
```typescript
const { activityData, getActivityStats, resetActivity } = useActivityTracker({
  throttleInterval: 50,     // More frequent updates
  idleThreshold: 60000,     // 1 minute idle detection
  maxEvents: 2000,          // Store more events
  enableKeydown: true,      // Enable keyboard tracking
});
```

### Event Analysis
```typescript
// Analyze click patterns
const recentClicks = activityData.clicks.slice(-10);
const leftClicks = recentClicks.filter(click => click.button === 0);
const rightClicks = recentClicks.filter(click => click.button === 2);

// Analyze scroll behavior
const recentScrolls = activityData.scrolls.slice(-20);
const scrollDown = recentScrolls.filter(scroll => scroll.direction === 'down');
const averageSpeed = recentScrolls.reduce((sum, s) => sum + s.speed, 0) / recentScrolls.length;
```

## 📈 **Integration with AI Features**

### Break Suggestions
- **Activity Patterns**: Analyze mouse movement patterns
- **Click Frequency**: Monitor interaction intensity
- **Scroll Behavior**: Understand content consumption
- **Idle Detection**: Identify optimal break times

### Productivity Insights
- **Peak Hours**: Identify most active periods
- **Focus Patterns**: Analyze concentration periods
- **Distraction Detection**: Monitor attention shifts
- **Workflow Optimization**: Suggest productivity improvements

### Wellness Recommendations
- **Eye Strain Prevention**: Based on screen time and activity
- **Movement Reminders**: When sedentary periods detected
- **Mental Health**: Stress pattern recognition
- **Digital Balance**: Healthy technology usage

## 🔧 **Configuration Options**

### ActivityTrackerOptions
```typescript
interface ActivityTrackerOptions {
  throttleInterval?: number;  // Mouse move throttling (ms)
  idleThreshold?: number;     // Idle detection threshold (ms)
  maxEvents?: number;         // Maximum events to store
  enableKeydown?: boolean;    // Enable keyboard tracking
}
```

### Default Values
- **throttleInterval**: 100ms
- **idleThreshold**: 30000ms (30 seconds)
- **maxEvents**: 1000 events
- **enableKeydown**: false (privacy mode)

## 🎯 **Future Enhancements**

### Planned Features
- **Heatmap Generation**: Visual activity heatmaps
- **Pattern Recognition**: Advanced behavior analysis
- **Machine Learning**: AI-powered insights
- **Cross-Device Sync**: Multi-device tracking
- **Custom Alerts**: Personalized notifications
- **Data Visualization**: Advanced charts and graphs

### Performance Optimizations
- **Web Workers**: Background processing
- **IndexedDB**: Persistent storage
- **Compression**: Data compression for storage
- **Caching**: Intelligent data caching
- **Batch Processing**: Efficient event handling

This activity tracking system provides a comprehensive foundation for digital wellness applications, combining detailed user interaction analysis with privacy-focused design principles.

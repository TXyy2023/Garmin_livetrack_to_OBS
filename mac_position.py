import time
from CoreLocation import CLLocationManager, kCLAuthorizationStatusAuthorizedAlways
import objc
from Foundation import NSRunLoop, NSDate

class LocationDelegate (objc.lookUpClass('NSObject')):
    def init(self):
        self = objc.super(LocationDelegate, self).init()
        if self is None:
            return None
        self.location = None
        return self

    def locationManager_didUpdateLocations_(self, manager, locations):
        self.location = locations[-1]
        manager.stopUpdatingLocation()

    def locationManager_didFailWithError_(self, manager, error):
        print("Location error:", error)

    def locationManager_didChangeAuthorizationStatus_(self, manager, status):
        print(f"Authorization status changed: {status}")

def get_location():
    manager = CLLocationManager.alloc().init()
    delegate = LocationDelegate.alloc().init()
    manager.setDelegate_(delegate)

    if CLLocationManager.authorizationStatus() != kCLAuthorizationStatusAuthorizedAlways:
        manager.requestAlwaysAuthorization()

    manager.startUpdatingLocation()

    timeout = time.time() + 10  # 最多等10秒
    run_loop = NSRunLoop.currentRunLoop()
    end_time = time.time() + 10

    while delegate.location is None and time.time() < end_time:
        run_loop.runUntilDate_(NSDate.dateWithTimeIntervalSinceNow_(0.1))

    if delegate.location:
        loc = delegate.location
        coord = loc.coordinate()
        # print(f"Latitude: {coord.latitude}, Longitude: {coord.longitude}")
        # print(f"Altitude: {loc.altitude()} meters")
        # print(f"Horizontal Accuracy: {loc.horizontalAccuracy()} meters")
        # print(f"Vertical Accuracy: {loc.verticalAccuracy()} meters")
        # print(f"Speed: {loc.speed()} m/s")
        # print(f"Course: {loc.course()} degrees")
        # print(f"Timestamp: {loc.timestamp()}")
        return coord.latitude, coord.longitude
    else:
        return None

if __name__ == "__main__":
    location = get_location()
    print(location)
    if location:
        print(f"Latitude: {location[0]}, Longitude: {location[1]}")
    else:
        print("Failed to get location")
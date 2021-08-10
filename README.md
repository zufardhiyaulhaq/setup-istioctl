# Setup Istioctl
#### Install a specific version of Istioctl binary on the runner.

Acceptable values are latest or any semantic version string like `1.9.7`. Use this action in workflow to define which version of Istioctl will be used.

```yaml
- uses: zufardhiyaulhaq/setup-istioctl@v1.0.0
  with:
    version: '<version>'
```
Refer to the action metadata file for details about all the inputs https://github.com/zufardhiyaulhaq/setup-istioctl/blob/master/.github/workflows/main.yml

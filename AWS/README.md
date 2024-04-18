# Website Cloud Formation

This is the cloud formation for this website. This cloudformation will generate the entire website in AWS, complete with email forwarding, with a few caveats.

- You need to set the name of the S3 bucket, the domain names, and the email addresses. Some of these are environmnet variables, some of them are hard coded.
- You need to add records to the domains to forward to cloudfront. This *could* be in the cloudformation, but currently isn't.
- You need to set the email forward rule to active in the AWS console. This currently cannot be done in cloudformation, so you must do it through the console.
- You need to verify they forward to email account so that SES can forward the emails, and so SNS can send you the emails if they don't forward correctly.

There may be other small issues that I may have accidentally set manually, such as the format of the SNS. But *most* of it is in cloudformation.

The email forwarding lambda is all inline and is based on the code of [aws-lambda-ses-forwarder ](https://github.com/arithmetric/aws-lambda-ses-forwarder/blob/master/index.js). The main changes center around hard coding some simple configuration to make it shorter, and getting the email content straight from the SNS message, and not pulling it from S3.